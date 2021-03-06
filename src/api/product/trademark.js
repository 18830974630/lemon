import request from '@/utils/request'

// /admin/product/baseTrademark/remove/{id}
// 删除BaseTrademark

// POST /admin/product/baseTrademark/save
// 新增BaseTrademark

// PUT /admin/product/baseTrademark/update
// 修改BaseTrademark

// GET /admin/product/baseTrademark/{page}/{limit}
// 分页列表
export default {
    // 删除
    delete(id) {
        return request.delete(`/admin/product/baseTrademark/remove/${id}`)
    },
    // 增加，修改，区别有id为修改，没有id为增加
    addOrUpdate(trademark) {
        if (trademark.id) {
            return request.put('/admin/product/baseTrademark/update', trademark)
        } else {
            return request.post('/admin/product/baseTrademark/save', trademark)
        }
    },
    // 查
    getPageList(page, limit) {
        return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
    },
    // GET /admin/product/baseTrademark/getTrademarkList   所有的品牌列表
    getList() {
        return request.get('/admin/product/baseTrademark/getTrademarkList')
    }
}
