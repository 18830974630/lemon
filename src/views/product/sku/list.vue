<template>
  <div>
    <el-card class="sku-list">
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
              v-if="row.isSale === 1"
              @click="cancelSale(row.id)"
            ></HintButton>
            <HintButton
              title="上架"
              icon="el-icon-top"
              size="mini"
              type="info"
              v-if="row.isSale === 0"
              @click="onSale(row.id)"
            ></HintButton>

            <HintButton
              title="修改"
              icon="el-icon-edit"
              size="mini"
              type="primary"
              @click="modify"
            ></HintButton>
            <HintButton
              title="查看"
              icon="el-icon-info"
              size="mini"
              type="info"
              @click="showSkuInfo(row.id)"
            ></HintButton>
            <HintButton
              title="删除"
              icon="el-icon-delete"
              size="mini"
              type="danger"
              @click="remove(row)"
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

      <!-- 抽屉 -->
      <el-drawer :visible.sync="isShowSkuInfo" :with-header="false" size="50%">
        <el-row>
          <el-col :span="5">名称</el-col>
          <el-col :span="16">{{ skuInfo.skuName }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5">描述</el-col>
          <el-col :span="16">{{ skuInfo.skuDesc }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5">价格</el-col>
          <el-col :span="16">{{ skuInfo.price }}</el-col>
        </el-row>

        <el-row>
          <el-col :span="5">平台属性</el-col>
          <el-col :span="18">
            <el-tag
              type="success"
              style="margin-right: 5px"
              v-for="value in skuInfo.skuAttrValueList"
              :key="value.id"
            >
              {{ value.attrId + "-" + value.valueId }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="5">销售属性</el-col>
          <el-col :span="18">
            <el-tag
              type="success"
              style="margin-right: 5px"
              v-for="value in skuInfo.skuSaleAttrValueList"
              :key="value.id"
            >
              {{ value.id + "-" + value.saleAttrValueId }}
            </el-tag>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="5">商品图片</el-col>
          <el-col :span="16">
            <el-carousel class="sku-carousel" trigger="click" height="400px">
              <el-carousel-item
                v-for="item in skuInfo.skuImageList"
                :key="item.id"
              >
                <img :src="item.imgUrl" alt="" />
              </el-carousel-item>
            </el-carousel>
          </el-col>
        </el-row>
      </el-drawer>
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
      skuInfo: {},
      isShowSkuInfo: false,
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    // 抽屉
    async showSkuInfo(id) {
      this.isShowSkuInfo = true;
      const result = await this.$API.sku.get(id);
      if (result.code === 200) {
        this.skuInfo = result.data;
      }
    },
    // 删除
    async remove(row) {
      // console.log(row)
      const result = await this.$API.sku.remove(row.id);
      if (result.code === 200) {
        this.$message.success("删除成功");
        this.getList();
      } else {
        this.$message.error("删除失败");
      }
    },
    // 修改
    modify() {
      this.$message.success("研发中....");
    },
    // 上架
    async onSale(skuId) {
      // console.log(row.id);
      const result = await this.$API.sku.onSale(skuId);
      if (result.code === 200) {
        this.$message.success("上架成功");
        this.getList();
      } else {
        this.$message.error("上架失败");
      }
    },
    // 下架
    async cancelSale(skuId) {
      const result = await this.$API.sku.cancelSale(skuId);
      if (result.code === 200) {
        this.$message.success("下架成功");
        this.getList();
      } else {
        this.$message.error("下架失败");
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

<style lang="scss" scoped>
.sku-list {
  .el-row {
    height: 40px;
    .el-col {
      line-height: 40px;
      &.el-col-5 {
        font-size: 18px;
        font-weight: bold;
        text-align: right;
        margin-right: 20px;
      }
    }
  }

  .sku-carousel {
    width: 400px;
    border: 1px solid #ccc;
    img {
      width: 400px;
      height: 400px;
    }
    /deep/.el-carousel__indicator {
      button {
        background-color: hotpink;
        display: inline-block;
        border-radius: 50%;
        height: 5px;
        width: 5px;
      }
      &.is-active {
        button {
          background-color: green;
        }
      }
    }
  }
}
</style>
