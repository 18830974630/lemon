<template>
  <div>
    <!-- 三级分类列表 -->
    <el-card>
      <CategorySelector @categoryChange="categoryChange" :isShowList="isShowList"></CategorySelector>
    </el-card>

    <!-- 主题内容 -->
    <el-card style="margin-top:20px">
      <div v-show="isShowList">
        <!-- button 按钮 -->
        <el-button type="primary" icon="el-icon-plus" :disabled="!category3Id" @click="showAddDiv">点击添加</el-button>
        <!-- table 列表 -->
        <el-table :data="attrList" style="width: 100%;" border>
          <el-table-column type="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="attrName" label="属性列表" width="150"></el-table-column>
          <el-table-column prop="prop" label="属性值列表" width="width">
            <template slot-scope="{row,$index}">
              <el-tag type="success" v-for="(attrValue,index) in row.attrValueList" :key="attrValue.id">{{attrValue.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{row,$index}">
              <HintButton type="warning" icon="el-icon-edit" size="mini" @click="showAddList(row)" title="修改"></HintButton>
              <el-popconfirm
                :title="`确定删除${row.attrName}吗？`"
                @onConfirm="deleteAttr(row)"
              >
                <HintButton slot="reference" type="danger" icon="el-icon-delete" size="mini" title="删除"></HintButton>
              </el-popconfirm>
              
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 添加界面 -->
      <div v-show="!isShowList">
        <el-form :inline="true" :model="attr">
          <el-form-item label="属性名">
            <el-input v-model="attr.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" icon="el-icon-plus" @click="addList" :disabled="!attr.attrName">添加属性值</el-button>
        <el-button @click="isShowList = true">取消</el-button>

        <el-table :data="attr.attrValueList" style="width: 100%; margin:20px 0" border>
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="prop" label="属性值名称" width="width">
            <template slot-scope="{row,$index}">
              <el-input v-model="row.valueName" placeholder="请输入属性值" size="mini" v-if="row.isEdit" :ref="$index" @blur="toLook(row)" @keyup.enter.native="toLook(row)"></el-input>
              <span v-else @click="toEdit(row,$index)" style="display: block">{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{row,$index}">
              <el-popconfirm
                :title="`确定删除${row.valueName}吗？`"
                @onConfirm="attr.attrValueList.splice($index, 1)"
              >
                <HintButton slot="reference" type="danger" icon="el-icon-delete" size="mini" title="删除"></HintButton>
              </el-popconfirm>
              
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" :disabled="attr.attrValueList.length === 0" @click="save">保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>

    <!-- 添加界面 -->
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [],
      isShowList: true,

      attr: {
        attrName: "",
        attrValueList: [],
        categoryId: 0,
        categoryLevel: 3,
      },
    };
  },
  methods: {
    // 删除 
    async deleteAttr(row){
      const result = await this.$API.attr.delete(row.id)
      if(result.code === 200){
        this.$message.success("删除成功")
        this.getAttrList()
      }else{
        this.$message.error("删除失败")
      }
    },
    // 保存
    async save(){
      // 拿数据
      let attr = this.attr;
      // 整理数据
      //    筛选 去掉无用的 isEdit
      //    去掉空值
      attr.attrValueList = attr.attrValueList.filter((item)=>{
        if(item.valueName !== ""){
          delete item.isEdit;
          return true;
        }
      });
      // 3、如果属性当中属性值列表没有属性值对象 不发请求
      if(attr.attrValueList.length === 0) return;
      // 发请求
      const result = await this.$API.attr.addOrUpdate(attr);
      if(result.code === 200){
        // 成功
        this.$message.success("保存成功")
        this.isShowList = true;
        this.getAttrList();
      }else{
        // 失败
        this.$message.error("保存失败")
      }
    },
    //input失去焦点或者回车之后变为查看模式
    toLook(row){
      // 储存原来的值
      var oldValueName = row.valueName;
      // 规则   数据不能为空
      if(row.valueName.trim() === ''){
        this.$message.error('数据不能为空')
        row.valueName = oldValueName;
        return
      }

      // 出来自身以外不能有重复
      let isRepeat = this.attr.attrValueList.some((item)=>{
        if(item !== row){
          return item.valueName === row.valueName;
        }
      });
      if(isRepeat){
        row.valueName = oldValueName;
        this.$message.error("输入数据不能重复"); 
        return
      }
      row.isEdit = false;
    },
    //点击span，变为编辑模式
    toEdit(row,index){
      row.isEdit = true;
      this.$nextTick(()=>{
        this.$refs[index].focus();
      })
    },
    // 站位添加
    addList() {
      this.attr.attrValueList.push({
        attrId: this.attr.id,
        valueName: "",
        isEdit: true,//切换编辑模式和输入模式
      });
      // 等待页面最近一次更新完成之后，让数据成为响应式数据
      this.$nextTick(()=>{
        this.$refs[this.attr.attrValueList.length - 1].focus();
      })
    },
    
    // 点击列表页的添加属性逻辑
    showAddDiv() {
      this.isShowList = false;
      this.attr = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3,
      };
    },
    // 修改
    showAddList(row) {
      this.isShowList = false;
      this.attr = cloneDeep(row);
      this.attr.attrValueList.forEach((item)=>{
        this.$set(item,"isEdit",false);
      })
    },
    // 接收三级列表数据
    categoryChange({ categoryId, level }) {
      if (level === 1) {
        this.category2Id = "";
        this.category3Id = "";
        this.attrList = [];
        this.category1Id = categoryId;
      } else if (level === 2) {
        this.category3Id = "";
        this.attrList = [];
        this.category2Id = categoryId;
      } else {
        this.category3Id = categoryId;
        this.getAttrList();
      }
    },
    // 发送请求获取数据
    async getAttrList() {
      let { category1Id, category2Id, category3Id } = this;
      let result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code === 200) {
        this.attrList = result.data;
      }
    },
  },
};
</script>

