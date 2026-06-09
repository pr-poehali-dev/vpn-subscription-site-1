import json
import os
import uuid
import psycopg2
import urllib.request
import urllib.error
import base64


def handler(event: dict, context) -> dict:
    """Создание платежа в ЮКассе и сохранение заказа в БД"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    body = json.loads(event.get('body', '{}'))
    plan_id = body.get('plan_id')
    plan_name = body.get('plan_name')
    amount = body.get('amount')
    email = body.get('email', '')

    if not plan_id or not amount:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'plan_id and amount are required'})
        }

    shop_id = os.environ['YUKASSA_SHOP_ID']
    secret_key = os.environ['YUKASSA_SECRET_KEY']

    idempotence_key = str(uuid.uuid4())

    payment_payload = {
        'amount': {
            'value': str(amount) + '.00',
            'currency': 'RUB'
        },
        'confirmation': {
            'type': 'redirect',
            'return_url': os.environ.get('RETURN_URL', 'https://poehali.dev')
        },
        'capture': True,
        'description': f'Подписка NordShield VPN — {plan_name}',
        'metadata': {
            'plan_id': plan_id,
            'plan_name': plan_name
        }
    }

    if email:
        payment_payload['receipt'] = {
            'customer': {'email': email},
            'items': [{
                'description': f'Подписка NordShield VPN — {plan_name}',
                'quantity': '1',
                'amount': {'value': str(amount) + '.00', 'currency': 'RUB'},
                'vat_code': 1
            }]
        }

    credentials = base64.b64encode(f'{shop_id}:{secret_key}'.encode()).decode()
    req = urllib.request.Request(
        'https://api.yookassa.ru/v3/payments',
        data=json.dumps(payment_payload).encode('utf-8'),
        headers={
            'Authorization': f'Basic {credentials}',
            'Idempotence-Key': idempotence_key,
            'Content-Type': 'application/json'
        },
        method='POST'
    )

    with urllib.request.urlopen(req) as resp:
        payment = json.loads(resp.read().decode('utf-8'))

    payment_id = payment['id']
    confirmation_url = payment['confirmation']['confirmation_url']

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO orders (payment_id, plan_id, plan_name, amount, email, status)
           VALUES (%s, %s, %s, %s, %s, 'pending')""",
        (payment_id, plan_id, plan_name, amount, email)
    )
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'payment_id': payment_id,
            'confirmation_url': confirmation_url
        })
    }
