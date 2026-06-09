import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Обработка вебхука от ЮКассы — обновление статуса заказа"""
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

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body) if raw_body.strip() else {}
    event_type = body.get('event')
    payment_obj = body.get('object', {})
    payment_id = payment_obj.get('id')
    payment_status = payment_obj.get('status')

    if not payment_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid webhook payload'})
        }

    status_map = {
        'payment.succeeded': 'paid',
        'payment.canceled': 'canceled',
        'refund.succeeded': 'refunded'
    }

    new_status = status_map.get(event_type)
    if not new_status:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': True})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute(
        """UPDATE orders SET status = %s, updated_at = NOW()
           WHERE payment_id = %s""",
        (new_status, payment_id)
    )
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }