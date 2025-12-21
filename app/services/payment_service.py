"""
Payment Service - Placeholder
"""


class PaymentService:
    """Payment service - to be implemented"""

    @staticmethod
    def get_customer_debt(customer_id):
        return {'success': True, 'data': {'total_debt': 0, 'transactions': []}}

    @staticmethod
    def get_customer_payments(customer_id, page=1, per_page=20):
        return {'success': True, 'data': {'payments': []}, 'meta': {'page': page, 'total': 0}}

    @staticmethod
    def make_payment(customer_id, transaction_id, amount, payment_method):
        return {'success': True, 'message': 'Not implemented yet'}
