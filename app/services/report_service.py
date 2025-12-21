"""
Report Service - Placeholder
"""


class ReportService:
    """Report service - to be implemented"""

    @staticmethod
    def get_merchant_summary(merchant_id, branch_id=None, from_date=None, to_date=None):
        return {
            'success': True,
            'data': {
                'total_transactions': 0,
                'total_amount': 0,
                'total_returns': 0,
                'returns_amount': 0,
                'net_amount': 0,
            }
        }

    @staticmethod
    def get_transaction_report(merchant_id, branch_id=None, from_date=None, to_date=None, group_by='day'):
        return {'success': True, 'data': {'data': []}}

    @staticmethod
    def get_admin_overview(from_date=None, to_date=None):
        return {'success': True, 'data': {}}

    @staticmethod
    def get_financial_report(from_date=None, to_date=None):
        return {'success': True, 'data': {}}
