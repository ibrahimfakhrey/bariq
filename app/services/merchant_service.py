"""
Merchant Service - Placeholder
"""


class MerchantService:
    """Merchant service - to be implemented"""

    @staticmethod
    def register_merchant(data):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def get_merchant_profile(merchant_id):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def update_merchant_profile(merchant_id, data):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def get_regions(merchant_id):
        return {'success': True, 'data': {'regions': []}}

    @staticmethod
    def create_region(merchant_id, data):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def update_region(merchant_id, region_id, data):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def delete_region(merchant_id, region_id):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def get_branches(merchant_id, region_id=None, is_active=None):
        return {'success': True, 'data': {'branches': []}}

    @staticmethod
    def create_branch(merchant_id, data):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def get_branch(merchant_id, branch_id):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def update_branch(merchant_id, branch_id, data):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def get_staff(merchant_id, role=None, branch_id=None):
        return {'success': True, 'data': {'staff': []}}

    @staticmethod
    def create_staff(merchant_id, data):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def update_staff(merchant_id, staff_id, data):
        return {'success': True, 'message': 'Not implemented yet'}

    @staticmethod
    def get_stores_for_customer(city=None, search=None, page=1, per_page=20):
        return {'success': True, 'data': {'merchants': []}}

    @staticmethod
    def get_store_details(merchant_id):
        return {'success': True, 'message': 'Not implemented yet'}
