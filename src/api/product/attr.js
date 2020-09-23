import request from '@/utils/request'

// GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
export default {
    // 删除
    // DELETE /admin/product/deleteAttr/{attrId}
    delete(attrId) {
        return request.delete(`/admin/product/deleteAttr/${attrId}`)
    },

    // POST /admin/product/saveAttrInfo
    addOrUpdate(attr) {
        return request.post('/admin/product/saveAttrInfo', attr)
    },
    // 查
    getList(category1Id, category2Id, category3Id) {
        return request.get(`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)
    }
}
