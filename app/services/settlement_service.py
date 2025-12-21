"""
Settlement Service - Placeholder
"""


class SettlementService:
    """Settlement service - to be implemented"""

    @staticmethod
    def get_merchant_settlements(merchant_id, branch_id=None, status=None, page=1):
        return {'success': True, 'data': {'settlements': []}, 'meta': {'page': page, 'total': 0}}

    @staticmethod
    def get_settlement_details(merchant_id, settlement_id):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def get_all_settlements(status=None, merchant_id=None, page=1):
        return {'success': True, 'data': {'settlements': []}, 'meta': {'page': page, 'total': 0}}

    @staticmethod
    def get_settlement_details_admin(settlement_id):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def approve_settlement(settlement_id, admin_id):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def mark_as_transferred(settlement_id, transfer_reference, admin_id):
        return {'success': True, 'message': 'Not implemented yet'}
