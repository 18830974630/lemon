<template>
  <div>
    <el-card>
      <el-table style="width: 100%" border stripe :data="skuList">
        <el-table-column type="index" label="序号" width="80" align="center">
        </el-table-column>
        <el-table-column prop="skuName" label="名称" width="width">
        </el-table-column>
        <el-table-column prop="skuDesc" label="描述" width="width">
        </el-table-column>
        <el-table-column label="默认图片" width="150" align="center">
          <template slot-scope="{ row, $index }">
            <el-image style="width: 80px" :src="row.skuDefaultImg"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(KG)" width="width">
        </el-table-column>
        <el-table-column prop="price" label="价格(元)" width="80">
        </el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template slot-scope="{ row, $index }">
            <HintButton
              title="下架"
              icon="el-icon-bottom"
              size="mini"
              type="success"
              v-show="isShow"
              @click="cancelSale(row)"
            ></HintButton>
            <HintButton
              title="上架"
              icon="el-icon-top"
              size="mini"
              type="info"
              v-show="!isShow"
              @click="onSale(row)"
            ></HintButton>

            <HintButton
              title="修改"
              icon="el-icon-edit"
              size="mini"
              type="primary"
            ></HintButton>
            <HintButton
              title="查看"
              icon="el-icon-info"
              size="mini"
              type="info"
            ></HintButton>
            <HintButton
              title="删除"
              icon="el-icon-delete"
              size="mini"
              type="danger"
            ></HintButton>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="getList"
        style="text-align: center"
        :current-page="page"
        :page-sizes="[10, 20, 50]"
        :page-size="limit"
        layout="prev, pager, next, jumper, ->, sizes, total"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Sku",
  data() {
    return {
      page: 1,
      limit: 10,
      total: 0,
      skuList: [],
      isShow: true,
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    // 上架
    async onSale(row) {
      console.log(row.id);
      const result = await this.$API.sku.onSale(row.id);
      if (result.code === 200) {
        // this.$message.success("上架成功");
      }
    },
    // 下架
    async cancelSale(row) {
      const result = await this.$API.sku.cancelSale(row.id);
      if (result.code === 200) {
        // this.$message.success("下架成功");
      }
    },
    async getList() {
      let { page, limit } = this;
      const result = await this.$API.sku.getList(page, limit);
      if (result.code === 200) {
        this.skuList = result.data.records;
        this.total = result.data.total;
      }
    },
    handleSizeChange(size) {
      this.limit = size;
    },
  },
};
</script>


