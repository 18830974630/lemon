<template>
  <div>
    <el-button type="primary" icon="el-icon-lius" @click="addList">添加</el-button>
    <el-table :data="trademarkList" style="width:100%;  margin:20px 0" border stripe>
      <el-table-column type="index" width="80" label="序号" align="center"></el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width"></el-table-column>
      <el-table-column label="品牌LOGO" width="width">
        <template slot-scope="{row,$index}">
          <el-image
            style="width: 100px; height: 60px"
            :src="row.logoUrl"
            :previewSrcList="previewSrcList(row)"
          ></el-image>
          <!-- <img :src="row.logoUrl" alt style="width:100px;height:60px" /> -->
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template slot-scope="{row,$index}">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="small"
            @click="showUpdateDialog(row)"
          >修改</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="small"
            @click="deleteTrademark(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="getTrademarkList"
      style="text-align:center"
      :current-page="page"
      :page-sizes="[10, 8, 7]"
      :page-size="limit"
      layout="prev, pager, next, jumper, ->, sizes, total"
      :total="total"
    ></el-pagination>

    <!-- 增加表单 -->
    <el-dialog :title="form.id?'修改品牌':'添加品牌'" :visible.sync="isShowDialog">
      <el-form :model="form" style="width:80%" :rules="rules" ref="form">
        <el-form-item label="活动名称" :label-width="'100px'"  prop="tmName">
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>

        <!-- 上传 -->
        <el-form-item label="品牌LOGO" :label-width="'100px'" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>

      <!-- 按钮 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="dialogFormVisible">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    return {
      page: 1,
      limit: 10,
      trademarkList: [],
      total: 0,
      isShowDialog: false,
      form: {
        tmName: "",
        logoUrl: "",
      },
      rules: {
        tmName: [
          { required: true, message: "请输入内容", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "change",
          },
        ],
        logoUrl: [{ required: true, message: "请上传图片", trigger: "blur" }],
      },
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    // 获取页面动态数据
    async getTrademarkList(page = 1) {
      this.page = page;
      const result = await this.$API.trademark.getPageList(
        this.page,
        this.limit
      );
      if (result.code === 200) {
        this.trademarkList = result.data.records;
        this.total = result.data.total;
        // this.srcList = result.data.records.logoUrl;
      }
    },

    // 分页器选择当前页展示数据个数
    handleSizeChange(size) {
      this.limit = size;
      this.getTrademarkList();
    },

    // 添加按钮
    addList() {
      this.isShowDialog = true;
      this.form = {
        tmName: "",
        logoUrl: "",
      };
    },

    // dialog表单确认按钮
    dialogFormVisible() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let trademark = this.form;
          let result = await this.$API.trademark.addOrUpdate(trademark);
          if (result.code === 200) {
            this.$message.success(`${trademark.id ? "修改" : "添加"}品牌成功`);
            this.isShowDialog = false;
            this.getTrademarkList(trademark.id ? this.page : 1);
          } else {
            this.$message.error(`${trademark.id ? "修改" : "添加"}品牌失败`);
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    // 上传
    //上传成功的回调函数
    handleAvatarSuccess(res, file) {
      // 保存图片真实地址
      this.form.logoUrl = res.data;
    },

    //在上传之前可以对上传的文件做限制
    beforeAvatarUpload(file) {
      const typeArr = ["image/jpeg", "image/png"];
      const isJPGOrPNG = typeArr.some((item) => item === file.type);
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPGOrPNG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPGOrPNG && isLt2M;
    },

    // 修改
    showUpdateDialog(row) {
      this.isShowDialog = true;
      // 浅拷贝
      this.form = { ...row };
    },

    // 删除
    deleteTrademark(row) {
      this.$confirm(`你确定删除${row.tmName}吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const result = await this.$API.trademark.delete(row.id);
          if (result.code === 200) {
            this.$message.success("删除成功");
            this.getTrademarkList(
              this.trademarkList.length > 1 ? this.page : this.page - 1
            );
          } else {
            this.$message.info("删除失败");
          }
        })
        .catch(() => {
          this.$message.info("取消删除");
        });
    },

    // 大图预览
    previewSrcList(row) {},
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>