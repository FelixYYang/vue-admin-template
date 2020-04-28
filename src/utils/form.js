export default function(getList, create, update, destroy) {
  return {
    data() {
      return {
        list: [],
        total: null,
        listLoading: false,
        listQuery: {
          page: 1,
          limit: 15
        },
        tempRow: {},
        temp: Object.assign({}, this.defaultTemp),

        formVisible: false,
        formLoading: false,

        formStatus: 'create',
        textMap: {
          update: '编辑',
          create: '创建'
        }
      }
    },
    methods: {
      fetchData() {
        this.listLoading = true
        return getList(this.listQuery).then(response => {
          this.list = response.data
          this.total = response.total
          this.listLoading = false
        })
      },
      extractRowData(row) {
        const data = {}
        for (const key of Object.keys(this.defaultTemp)) {
          if (Array.isArray(row[key]) || row[key] instanceof Object) {
            data[key] = JSON.parse(JSON.stringify(row[key]))
          } else {
            data[key] = row[key]
          }
        }
        data.id = row.id
        return data
      },
      resetTemp(row) {
        if (row) {
          this.temp = this.extractRowData(row)
        } else {
          this.temp = JSON.parse(JSON.stringify(this.defaultTemp))
        }
        this.$emit('form-reset', row || null)
      },
      getFormatForm() {
        return this.temp
      },
      toCreate() {
        this.resetTemp()
        this.formStatus = 'create'
        this.formVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      create() {
        this.$emit('form-creating')
        this.$refs['dataForm'].validate(valid => {
          if (valid) {
            this.formLoading = true
            create(this.getFormatForm()).then(response => {
              this.$message({
                message: '添加成功！',
                type: 'success'
              })
              this.$emit('form-created')
              this.formLoading = false
              this.formVisible = false
              this.fetchData()
            }).catch(error => {
              this.formLoading = false
              return Promise.reject(error)
            })
          }
        })
      },
      toUpdate(row) {
        this.tempRow = row
        this.resetTemp(row)
        this.temp.password = undefined
        this.formStatus = 'update'

        this.formVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      update() {
        this.$emit('form-updating')
        this.$refs['dataForm'].validate(valid => {
          if (valid) {
            this.formLoading = true
            const data = this.getFormatForm()
            update(data.id, data).then(response => {
              const item = response
              for (const v of this.list) {
                if (v.id === item.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, item)
                  break
                }
              }
              this.$message({
                message: '更新成功！',
                type: 'success'
              })
              this.$emit('form-updated', item)
              this.formLoading = false
              this.formVisible = false
            }).catch(error => {
              this.formLoading = false
              return Promise.reject(error)
            })
          }
        })
      },
      destroy(row) {
        this.$confirm('确认删除？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true
          return destroy(row.id).then((response) => {
            const item = response || row
            for (const v of this.list) {
              if (v.id === item.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1)
                break
              }
            }
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.listLoading = false
          })
        }).catch(() => {
          this.listLoading = false
        })
      },
      listSizeChange(val) {
        this.listQuery.limit = val
        this.fetchData()
      },
      listPageChange(val) {
        this.listQuery.page = val
        this.fetchData()
      },
      handleFilter() {
        this.$emit('before-filter')
        this.listQuery.page = 1
        this.fetchData()
      }
    }
  }
}
