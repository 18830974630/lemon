<template>
  <el-form label-width="100px" :model="skuInfo">
    <el-form-item label="spu名称">{{ spu.spuName }}</el-form-item>

    <el-form-item label="sku名称">
      <el-input placeholder="sku名称" v-model="skuInfo.skuName"></el-input>
    </el-form-item>

    <el-form-item label="价格(元)">
      <el-input
        type="number"
        placeholder="sku价格"
        v-model="skuInfo.price"
      ></el-input>
    </el-form-item>

    <el-form-item label="重量(千克)">
      <el-input
        placeholder="sku重量"
        type="number"
        v-model="skuInfo.weight"
      ></el-input>
    </el-form-item>

    <el-form-item label="规格描述">
      <el-input
        placeholder="规格描述"
        type="textarea"
        rows="4"
        v-model="skuInfo.skuDesc"
      ></el-input>
    </el-form-item>

    <el-form-item label="平台属性">
      <el-form label-width="100px" :inline="true">
        <el-form-item
          :label="attrInfo.attrName"
          v-for="(attrInfo, index) in attrInfoList"
          :key="attrInfo.id"
        >
          <el-select placeholder="请输入" v-model="attrInfo.attrIdValueId">
            <el-option
              :value="`${attrInfo.id}:${attrValue.id}`"
              :label="attrValue.valueName"
              v-for="(attrValue, index) in attrInfo.attrValueList"
              :key="attrValue.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-form label-width="100px" :inline="true">
        <el-form-item
          :label="spuSaleAttr.saleAttrName"
          v-for="(spuSaleAttr, index) in spuSaleAttrList"
          :key="spuSaleAttr.id"
        >
          <el-select placeholder="请输入" v-model="spuSaleAttr.saleAttrValueId">
            <el-option
              :value="spuSaleAttrValue.id"
              :label="spuSaleAttrValue.saleAttrValueName"
              v-for="(spuSaleAttrValue,
              index) in spuSaleAttr.spuSaleAttrValueList"
              :key="spuSaleAttrValue.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="图片列表">
      <el-table
        border
        style="width: 100%"
        :data="spuImageList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="图片" width="width">
          <template slot-scope="{ row, $index }">
            <img :src="row.imgUrl" alt="" style="width: 100px; height: 50px" />
          </template>
        </el-table-column>
        <el-table-column prop="imgName" label="名称" width="width">
        </el-table-column>
        <el-table-column label="操作" width="width">
          <template slot-scope="{ row, $index }">
            <el-button
              type="primary"
              size="mini"
              @click="setDefault(row)"
              v-if="row.isDefault === '0'"
              >选择默认</el-button
            >
            <el-tag type="success" v-else>默认</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="cancelback">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "SkuForm",
  data() {
    return {
      spu: {},
      // 收集到的数据
      skuInfo: {
        category3Id: "",
        spuId: "",
        tmId: "",
        // 名称
        skuName: "",
        // 价钱
        price: "",
        // 重量
        weight: "",
        // 描述
        skuDesc: "",
        //默认图片路径
        skuDefaultImg: "",
        // 平台属性
        skuAttrValueList: [
          // {
          //   attrId: 0,
          //   valueId: 0,
          // },
        ],
        // 图片列表
        skuImageList: [
          // {
          //   imgName: "string",
          //   imgUrl: "string",
          //   isDefault: "string",
          //   spuImgId: 0,
          // },
        ],
        // 销售属性
        skuSaleAttrValueList: [
          // {
          //   saleAttrValueId: 0,
          // },
        ],
      },
      // 品台属性列表
      attrInfoList: [],
      // 销售属性
      spuSaleAttrList: [],
      // 用来展示spu图片列表
      spuImageList: [],
      // 用来收集spu图片列表
      selectedImgList: [],
    };
  },
  methods: {
    // 取消
    cancelback(){
      this.$emit('update:visible', false) //返回到spu列表页面
      this.resetData()
    },
    // 清空数据
    resetData(){
      this.spu= {}
      this.skuInfo= {
        category3Id: "",
        spuId: "",
        tmId: "",
        skuName: "",
        price: "",
        weight: "",
        skuDesc: "",
        skuDefaultImg: "",
        skuAttrValueList: [],
        skuImageList: [],
        skuSaleAttrValueList: [],
      },
      this.attrInfoList= []
      this.spuSaleAttrList= []
      this.spuImageList= []
      this.selectedImgList= []
    },
    // 保存
    async save() {
      // 拿数据
      let {
        skuInfo,
        spu,
        attrInfoList,
        spuSaleAttrList,
        selectedImgList,
      } = this;
      // // 整理数据
      skuInfo.category3Id = spu.category3Id;
      skuInfo.spuId = spu.id;
      skuInfo.tmId = spu.tmId;
      // // attrIdValueId  平台属性
      skuInfo.skuAttrValueList = attrInfoList.reduce((pre, item) => {
        if (item.attrIdValueId) {
          let [attrId, valueId] = item.attrIdValueId.split(":");
          let obj = {
            attrId,
            valueId,
          };
          pre.push(obj);
        }
        return pre;
      }, []);

      // // spuSaleAttrList 销售属性
      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((pre, item) => {
        if (item.saleAttrValueId) {
          let { saleAttrValueId } = item;
          let obj = { saleAttrValueId };
          pre.push(obj);
        }
        return pre;
      }, []);

      skuInfo.skuImageList = selectedImgList.map((item) => {
        return {
          imgName: item.imgName,
          imgUrl: item.imgUrl,
          isDefault: item.isDefault,
          spuImgId: item.id,
        };
      });
      console.log(skuInfo);
      // 发请求
      const result = await this.$API.sku.addUpdate(skuInfo);
      if (result.code === 200) {
        // 成功
        this.$message.success('保存成功')
        this.resetData();
        this.$emit('update:visible', false)
      } else {
        // 失败
        this.$message.danger('保存失败')
      }
    },
    // 默认图片
    setDefault(row) {
      this.spuImageList.forEach((item) => (item.isDefault = "0"));
      row.isDefault = "1";
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },
    // 收集选中图片
    handleSelectionChange(val) {
      this.selectedImgList = val;
    },
    // 发送请求
    async initAddSkuFormData(row, category1Id, category2Id) {
      this.spu = row;
      // http://localhost:9529/dev-api/admin/product/attrInfoList/1/1/1
      const promise1 = this.$API.attr.getList(
        category1Id,
        category2Id,
        row.category3Id
      );
      // http://localhost:9529/dev-api/admin/product/spuSaleAttrList/1542
      const promise2 = this.$API.sku.getSpuSaleAttrList(row.id);
      // http://localhost:9529/dev-api/admin/product/spuImageList/1542
      const promise3 = this.$API.sku.getSpuImageList(row.id);
      // 发送请求
      const resulu = await Promise.all([promise1, promise2, promise3]);
      this.attrInfoList = resulu[0].data;
      this.spuSaleAttrList = resulu[1].data;
      let spuImageList = resulu[2].data;
      spuImageList.forEach((item) => (item.isDefault = "0"));
      this.spuImageList = spuImageList;
    },
  },
};
</script>


