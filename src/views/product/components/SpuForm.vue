<template>
  <el-form :model="spuInfo">
    <el-form-item label="SPU名称" label-width="100px">
      <el-input v-model="spuInfo.spuName" placeholder="SPU名称"></el-input>
    </el-form-item>

    <el-form-item label="品牌" label-width="100px">
      <el-select placeholder="请选择品牌" v-model="spuInfo.tmId">
        <el-option
          :value="tm.id"
          :label="tm.tmName"
          v-for="tm in trademarkList"
          :key="tm.id"
        >
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="SPU描述" label-width="100px">
      <el-input
        placeholder="SPU描述"
        type="textarea"
        rows="4"
        v-model="spuInfo.description"
      ></el-input>
    </el-form-item>

    <el-form-item label="SPU图片" label-width="100px">
      <el-upload
        action="/dev-api/admin/product/fileUpload"
        list-type="picture-card"
        :file-list="spuImageList"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="handleUpload"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </el-form-item>

    <el-form-item label="销售属性" label-width="100px">
      <el-select
        :placeholder="
          unUsedSaleAttrList.length > 0
            ? `还有${unUsedSaleAttrList.length}项没选择`
            : '没啦！！！'
        "
        v-model="attrIdAttrName"
      >
        <el-option
          :label="unUsedSaleAttr.name"
          :value="`${unUsedSaleAttr.id}:${unUsedSaleAttr.name}`"
          v-for="(unUsedSaleAttr, index) in unUsedSaleAttrList"
          :key="unUsedSaleAttr.id"
        >
        </el-option>
      </el-select>
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="addSaleAttr"
        :disabled="!attrIdAttrName"
        >添加销售属性</el-button
      >
      <el-table
        border
        style="width: 100%; margin-top: 20px"
        :data="spuInfo.spuSaleAttrList"
      >
        <el-table-column align="center" type="index" label="序号" width="80">
        </el-table-column>
        <el-table-column prop="saleAttrName" label="属性名" width="150">
        </el-table-column>
        <el-table-column label="属性值名称列表" width="width">
          <template slot-scope="{ row, $index }">
            <el-tag
              v-for="(spuSaleAttrValue, index) in row.spuSaleAttrValueList"
              :key="spuSaleAttrValue.id"
              closable
              :disable-transitions="false"
              @close="row.spuSaleAttrValueList.splice(index, 1)"
            >
              {{ spuSaleAttrValue.saleAttrValueName }}
            </el-tag>

            <el-input
              v-if="row.isShowInput"
              v-model="row.saleAttrValueName"
              ref="saveTagInput"
              size="small"
              style="width: 150px"
              @keyup.enter.native="handleInputConfirm(row)"
              @blur="handleInputConfirm(row)"
            >
            </el-input>
            <el-button v-else size="small" @click="showInput(row)"
              >添加名称</el-button
            >
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="{ row, $index }">
            <el-popconfirm
              :title="`确定删除${row.saleAttrName}吗？`"
              @onConfirm="spuInfo.spuSaleAttrList.splice($index, 1)"
            >
              <HintButton
                slot="reference"
                type="danger"
                size="mini"
                icon="el-icon-delete"
                title="删除"
              ></HintButton>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item label-width="100px">
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "SpuForm",
  props: ["visible"],
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      spuInfo: {
        spuName: "",
        tmId: "",
        description: "",
        spuSaleAttrList: [],
      },
      spuImageList: [],
      trademarkList: [],
      baseSaleAttrList: [],
      category3Id: "",
      attrIdAttrName: "",
    };
  },
  computed: {
    unUsedSaleAttrList() {
      // return this.baseSaleAttrList.filter((baseSaleAttr) =>
      //   this.spuInfo.spuSaleAttrList.every(
      //     (spuSaleAttr) => spuSaleAttr.saleAttrName !== baseSaleAttr.name
      //   )
      // );
      return this.baseSaleAttrList.filter((baseSaleAttr) => {
        return this.spuInfo.spuSaleAttrList.every(
          (spuSaleAttr) => spuSaleAttr.saleAttrName !== baseSaleAttr.name
        );
      });
    },
  },
  methods: {
    //点击取消按钮的逻辑
    cancel() {
      this.resetData();
      this.$emit("update:visible", false);
      this.$emit("cancelBack");
    },

    //清空数据
    resetData() {
      this.dialogImageUrl = "";
      this.dialogVisible = false;
      this.spuInfo = {
        spuName: "",
        tmId: "",
        description: "",
        spuSaleAttrList: [],
        // spuImageList:[],   这个图片列表数据是在外面收集的，最后再整合进来，现在有没有都无所谓
      };
      this.spuImageList = []; //请求获取到的spu图片列表 || 收集的新的spu图片列表
      this.trademarkList = [];
      this.baseSaleAttrList = [];
      this.category3Id = "";
      this.attrIdAttrName = "";
    },

    //保存逻辑
    async save() {
      //拿参数
      let { spuInfo, spuImageList, category3Id } = this;
      //整理参数
      // 1、图片列表需要整理格式，需要把外面的图片列表数据整理然后放入spuinfo当中  参考文档添加的时候数据结构
      spuImageList = spuImageList.map((item) => {
        return {
          imgName: item.name,
          imgUrl: item.imgUrl || item.response.data,
        };
      });
      // 2、去除不需要传递的参数（isShowInput和saleAttrValueName)
      spuInfo.spuSaleAttrList.forEach((item) => {
        delete item.isShowInput;
        delete item.saleAttrValueName;
      });

      //3、把所有的参数都合并到spuInfo当中
      spuInfo.spuImageList = spuImageList;
      spuInfo.category3Id = category3Id;
      // console.log(spuInfo);
      //发请求
      const result = await this.$API.spu.addUpdate(spuInfo);
      if (result.code === 200) {
        //成功
        this.$message.success("保存spu成功");
        //返回列表页
        this.$emit("saveSuccess");
        //重置data的数据
        this.resetData();
      } else {
        //失败
        this.$message.error("保存spu失败");
      }
    },
    //input失去焦点或者回车逻辑
    handleInputConfirm(row) {
      //失去焦点后从当前这个属性row身上把收集到的属性值名称获取到，构造成属性值响应的对象 添加到属性值列表
      // "saleAttrValueName": "a",
      // "baseSaleAttrId": "1"
      let { saleAttrValueName, baseSaleAttrId } = row;
      let attrValue = { saleAttrValueName, baseSaleAttrId };

      //这一次不用除去自身判断重复，因为在判断之前我们根本没有push
      //平台属性值添加的时候我们是除去自身去判断重复 因为我们是先占的位

      let isRepeat = row.spuSaleAttrValueList.some(
        (spuSaleAttrValue) =>
          spuSaleAttrValue.saleAttrValueName === attrValue.saleAttrValueName
      );
      if (isRepeat) {
        this.$message.info("输入的属性值名称不能重复");
        return;
      }

      if (
        !attrValue.saleAttrValueName ||
        attrValue.saleAttrValueName.trim() === ""
      ) {
        row.isShowInput = false;
        row.saleAttrValueName = "";
        return;
      }

      row.spuSaleAttrValueList.push(attrValue);
      row.saleAttrValueName = ""; //清空input当中的数据
      row.isShowInput = false; //添加属性值成功后变为按钮
    },

    showInput(row) {
      // row.isShowInput = true
      this.$set(row, "isShowInput", true);
      this.$set(row, "saleAttrValueName", "");
      //自动获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },

    addSaleAttr() {
      //解构收集的销售属性id及销售属性名称
      let [baseSaleAttrId, saleAttrName] = this.attrIdAttrName.split(":");

      let attr = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [],
      };

      this.spuInfo.spuSaleAttrList.push(attr);

      this.attrIdAttrName = ""; //清空select选中的数据
    },

    // 进入界面发送请求，获取数据 添加
    async initAddSpuFormData(category3Id) {
      this.category3Id = category3Id;
      //通过点击父组件当中的添加spu按钮，父组件当中会调用这个函数
      // http://localhost:9529/dev-api/admin/product/baseTrademark/getTrademarkList
      const trademarkListResult = await this.$API.trademark.getList(); //获取所有的品牌列表
      if (trademarkListResult.code === 200) {
        this.trademarkList = trademarkListResult.data;
      }
      // http://localhost:9529/dev-api/admin/product/baseSaleAttrList
      const baseSaleAttrListResult = await this.$API.spu.getSaleList(); //获取当前修改的这个spu详情
      if (baseSaleAttrListResult.code === 200) {
        this.baseSaleAttrList = baseSaleAttrListResult.data;
      }
    },
    // 修改
    async initUpdateSpuFormData(row, category3Id) {
      this.category3Id = category3Id;
      //通过点击父组件当中的修改spu按钮，父组件当中会调用这个函数
      // http://localhost:9529/dev-api/admin/product/getSpuById/1507
      const result = await this.$API.spu.get(row.id); //获取当前修改的这个spu详情
      if (result.code === 200) {
        this.spuInfo = result.data;
      }
      // http://localhost:9529/dev-api/admin/product/spuImageList/1507
      const imageListResult = await this.$API.sku.getSpuImageList(row.id); //获取当前spu的图片列表
      let spuImageList = imageListResult.data;
      spuImageList.forEach((item) => {
        item.name = item.imgName;
        item.url = item.imgUrl;
      }); //拿到数据之后第一件事，在所有的图片对象数据当中全部添加name和url为了upload可以展示照片墙

      if (imageListResult.code === 200) {
        this.spuImageList = spuImageList;
      }
      // http://localhost:9529/dev-api/admin/product/baseTrademark/getTrademarkList
      const trademarkListResult = await this.$API.trademark.getList(); //获取所有的品牌列表
      if (trademarkListResult.code === 200) {
        this.trademarkList = trademarkListResult.data;
      }
      // http://localhost:9529/dev-api/admin/product/baseSaleAttrList
      const baseSaleAttrListResult = await this.$API.spu.getSaleList(); //获取当前修改的这个spu详情
      if (baseSaleAttrListResult.code === 200) {
        this.baseSaleAttrList = baseSaleAttrListResult.data;
      }
    },
    // 图片上传成功的回调
    handleUpload(res, file, fileList) {
      // console.log(res,file,fileList)
      this.spuImageList = fileList;
    },
    //点击图片上的删除按钮回调函数
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    //点击图片上的放大按钮回调函数，本质就是让dialog出现并且把dialog当中的img路径赋值为当前点击的这个图片路径
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
  },
};
</script>


