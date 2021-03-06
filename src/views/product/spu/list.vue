<template>
  <div>
    <el-card>
      <CategorySelector
        @categoryChange="categoryChange"
        :isShowList="isShowList"
      ></CategorySelector>
    </el-card>

    <el-card style="margin-top: 20px">
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showAddSpuForm"
          :disabled="!category3Id"
          >添加SPU</el-button
        >
        <el-table :data="spuList" border style="width: 100%">
          <el-table-column type="index" label="序号" align="center" width="80">
          </el-table-column>
          <el-table-column prop="spuName" label="SPU名称" width="width">
          </el-table-column>
          <el-table-column prop="description" label="SPU描述" width="width">
          </el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <HintButton
                icon="el-icon-plus"
                type="primary"
                size="mini"
                title="添加SKU"
                @click="showAddSkuForm(row)"
              ></HintButton>
              <HintButton
                icon="el-icon-edit"
                type="warning"
                size="mini"
                title="修改SPU"
                @click="showUpdateSpuForm(row)"
              ></HintButton>
              <HintButton
                icon="el-icon-info"
                type="info"
                size="mini"
                title="查看SPU所有的SKU"
                @click="seeAll(row)"
              ></HintButton>
              <el-popconfirm
                :title="`确定删除${row.spuName}吗？`"
                @onConfirm="onConfirm(row)"
              >
                <HintButton
                  icon="el-icon-delete"
                  type="danger"
                  size="mini"
                  title="删除SPU"
                  slot="reference"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="getSpuList"
          style="text-align: center"
          :current-page="page"
          :page-sizes="[3, 5, 10]"
          :page-size="limit"
          layout=" prev, pager, next, jumper, ->, sizes,total"
          :total="total"
        >
        </el-pagination>
      </div>

      <!-- <SpuForm v-show="isShowSpuForm" :visible="isShowSpuForm" @update:visible="isShowSpuForm = $event"></SpuForm> -->
      <SpuForm
        v-show="isShowSpuForm"
        ref="spu"
        :visible.sync="isShowSpuForm"
        @saveSuccess="saveSuccess"
        @cancelBack="cancelBack"
      ></SpuForm>

      <SkuForm
        ref="sku"
        v-show="isShowSkuForm"
        :visible.sync="isShowSkuForm"
      ></SkuForm>

      <el-dialog
        :title="`${spu.spuName}的sku列表`"
        :visible.sync="isShowDialog"
        :before-close="handlerClose"
      >
        <el-table :data="skuList" v-loading="loading">
          <el-table-column
            prop="skuName"
            label="名称"
            width="150"
          ></el-table-column>
          <el-table-column
            property="price"
            label="价格"
            width="200"
          ></el-table-column>
          <el-table-column property="weight" label="重量"> </el-table-column>
          <el-table-column property="address" label="默认图片">
            <template slot-scope="{ row, $index }">
              <img
                :src="row.skuDefaultImg"
                alt=""
                style="width: 100px; height: 80px"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import SkuForm from "@/views/product/components/SkuForm";
import SpuForm from "@/views/product/components/SpuForm";
export default {
  name: "Spu",
  data() {
    return {
      //这个数据就是用来控制三级分类可操作性的
      isShowList: true,

      category1Id: "",
      category2Id: "",
      category3Id: "",
      spuList: [],
      page: 1,
      limit: 5,
      total: 0,

      isShowSpuForm: false,
      isShowSkuForm: false,

      spu: {},
      isShowDialog: false,
      skuList: [],
      loading: false,
    };
  },
  components: {
    SkuForm,
    SpuForm,
  },
  watch: {
    //通过监视去控制三级分类的可操作行
    isShowSpuForm: {
      handler(val) {
        this.isShowList = !val;
      },
    },
    isShowSkuForm: {
      handler(val) {
        this.isShowList = !val;
      },
    },
  },
  methods: {

    //dialog关闭之前回调，里面可以做收尾工作
    handlerClose(){
      this.loading = false
      this.isShowDialog = false
      this.skuList = []
    },
    // 删除
    async onConfirm(row) {
      const result = await this.$API.spu.remove(row.id);
      if (result.code === 200) {
        this.$message.success("删除成功");
        this.getSpuList(this.page);
      } else {
        this.$message.error("删除失败");
      }
    },
    //取消回来的
    cancelBack() {
      this.spuId = null;
    },
    //保存spu返回到列表页的操作
    saveSuccess() {
      if (this.spuId) {
        //修改回来的
        this.getSpuList(this.page);
      } else {
        //添加回来的
        this.getSpuList();
      }
      this.isShowSpuForm = false;
      this.spuId = null;
    },

    // 查看SPU所有的SKU
    async seeAll(row) {
      this.loading = true;
      this.spu = row;
      this.isShowDialog = true;

      const result = await this.$API.sku.getListBySpuId(row.id);
      if (result.code === 200) {
        this.skuList = result.data;
      }
      this.loading = false;
    },
    //点击添加sku按钮逻辑
    showAddSkuForm(row) {
      this.isShowSkuForm = true;
      this.$refs.sku.initAddSkuFormData(
        row,
        this.category1Id,
        this.category2Id
      );
    },
    // 点击修改spu按钮逻辑
    showUpdateSpuForm(row) {
      this.spuId = row.id;
      this.isShowSpuForm = true;
      this.$refs.spu.initUpdateSpuFormData(row, this.category3Id);
    },
    //点击添加spu按钮逻辑
    showAddSpuForm() {
      this.isShowSpuForm = true;
      //初始化页面数据请求获取
      this.$refs.spu.initAddSpuFormData(this.category3Id);
    },
    // 三级列表获取数据
    categoryChange({ categoryId, level }) {
      if (level === 1) {
        this.category2Id = "";
        this.category3Id = "";
        this.spuList = [];
        this.category1Id = categoryId;
      } else if (level === 2) {
        this.category3Id = "";
        this.spuList = [];
        this.category2Id = categoryId;
      } else {
        this.category3Id = categoryId;
        this.getSpuList();
      }
    },
    // 发送请求
    async getSpuList(padee = 1) {
      this.page = padee;
      let { page, limit, category3Id } = this;
      let result = await this.$API.spu.getList(page, limit, category3Id);
      if (result.code === 200) {
        this.spuList = result.data.records;
        this.total = result.data.total;
      }
    },
    // 分页器
    handleSizeChange(size) {
      this.limit = size;
      this.getSpuList();
    },
  },
};
</script>

