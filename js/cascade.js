/**
 * @param { Array } data 下拉选项-多维数组
 * @param { Object } config 配置项
 * @param { String } config.elementID 节点ID
 * @param { Boolean } config.disable 是否禁用
 * @param { Boolean } config.showBreadcrumb 是否以面包屑形式展示所选中的值
 * @param { String } config.placeholder placeholder
 * @param { Boolean } config.search 下拉面板是否显示搜索框
 * @param { Function } config.onChange 选中事件监听
 * @method getValue 获取选中的值
 * @method setValue 设置值
 * @method getstatus 获取禁用状态
*/
(function() {
    
    var myCascade = function() {
        /**
         * 构造函数
         * @param { Array } data 下拉选项-多维数组
         * @param { Object } config 配置项
         * @param { String } config.elementID 节点ID
         * @param { Boolean } config.disable 是否禁用
         * @param { Boolean } config.showBreadcrumb 是否以面包屑形式展示所选中的值
         * @param { String } config.placeholder placeholder
         * @param { Boolean } config.search 下拉面板是否显示搜索框
         * @param { Function } config.onChange 选中事件监听
        */
        function Cascade(data, config) {
            this.disable = false // 禁用状态
            this.selectedData = [] // 选中的value
            this.selectedLabel = [] // 显示选中label
            this.showBreadcrumb = true // 是否以面包屑形式显示
            if(config.hasOwnProperty('showBreadcrumb') && typeof config.showBreadcrumb === 'boolean') {
                this.showBreadcrumb = config.showBreadcrumb
            }

            this.data = data
            this.config = config
            this.ele = document.getElementById(config.elementID)
            this.initNodes()
            this.renderInput()
            this.initEvents()

            if(this.config.disable) {
                this.disable = this.config.disable
                this.renderDisable()
            }
        }

        // 事件绑定
        Cascade.prototype.initEvents = function() {
            this.ele.addEventListener('click', this.bindCascaderClick.bind(this))
            document.addEventListener('click', this.bindBodyClick.bind(this))
        }

        /**
         * body点击隐藏级联面板
         */
        Cascade.prototype.bindBodyClick = function(e) {
            if(this.dropdownWrap) {
                this.dropdownWrap.style.display = 'none'
            }
            this.inputWrap.classList.remove('active')
        }

        Cascade.prototype.bindCascaderClick = function(e) {
            // 把其他选择器隐藏
            var list = document.getElementsByClassName('dm-dropdown-wrap')
            for(var i = 0; i < list.length; i ++) {
                if(list[i].parentElement.id !== this.config.elementID) {
                    list[i].style.display = 'none'
                }
            }
            if(this.disable === true) {
                return
            }
            // 阻止冒泡
            e.stopPropagation()

            this.inputWrap.classList.add('active')
            if(!this.dropdownWrap) {
                this.renderDropdown()
                this.dropdownWrap.style.display = 'block'
            } else {
                if(this.dropdownWrap.style.display == 'block')
                    this.dropdownWrap.style.display = 'none'
                else
                    this.dropdownWrap.style.display = 'block'
            }
        }

        // 初始化元素
        Cascade.prototype.initNodes = function() {
            this.ele.style.position = 'relative'
        }

        // 初始化头部input
        Cascade.prototype.renderInput = function() {
            var _this = this
            this.inputWrap = document.createElement('div')
            this.inputWrap.className = 'dm-input-wrap'
            var input = document.createElement('input')
            input.type = 'text'
            input.className = 'dm-input'
            input.setAttribute('readonly', 'readonly')
            if(this.config.placeholder) {
                input.placeholder = this.config.placeholder
            }
            this.inputWrap.appendChild(input)
            this.ele.appendChild(this.inputWrap)
        }

        // 生成下拉框
        Cascade.prototype.renderDropdown = function() {
            this.dropdownWrap = document.createElement('div')
            this.dropdownWrap.className = 'dm-dropdown-wrap'
            this.ele.appendChild(this.dropdownWrap)
            this.renderMenu(this.data)
            this.dropdownWrap.addEventListener('click', function(e) {
                e.stopPropagation()
            })
        }

        // 生成选项栏
        Cascade.prototype.renderMenu = function(data, level) {
            level = level || 0
            var _this = this
            var menu = document.createElement('div')
            menu.className = 'dm-cascade-menu'
            menu.setAttribute('level', level)

            // 如果有搜索
            if(this.config.search) {
                var input = document.createElement('input')
                input.type = 'text'
                input.className = 'search-input'
                input.addEventListener('input', debounce(function() {
                    _this.onInputChange(input.value, level)
                }, 300))
                menu.appendChild(input)
            }

            var ul = document.createElement('ul')
            for(var i = 0; i < data.length; i++) {
                var li = document.createElement('li')
                li.setAttribute('_value', data[i].value)
                li.setAttribute('_index', i)
                if(data[i].value === this.selectedData[level]) {
                    li.setAttribute('_checked', true)
                    li.classList.add('active')
                }
                li.addEventListener('click', function() {
                    for(var j =0; j < this.parentNode.childNodes.length; j++) {
                        this.parentNode.childNodes[j].removeAttribute('_checked')
                        this.parentNode.childNodes[j].classList.remove('active')
                    }
                    this.setAttribute('_checked', true)
                    this.classList.add('active')

                    // 移除当前面板的后续面板
                    for(var j = level + 1; j < _this.dropdownWrap.childNodes.length; j++) {
                        _this.dropdownWrap.removeChild(_this.dropdownWrap.childNodes[j])
                        j--
                    }
                    _this.calcDropdownWidth()
                    
                    var index = this.getAttribute('_index')
                    // 如果有子选项则生成子选项，没有则为选中
                    if(data[index].children && data[index].children instanceof Array && data[index].children.length) {
                        _this.renderMenu(data[index].children, level + 1)
                    } else {
                        _this.onChange()
                    }
                })
                var span = document.createElement('span')
                span.innerHTML = data[i].label
                li.appendChild(span)
                // 如果有子选项则加上右箭头
                if(data[i].children && data[i].children instanceof Array && data[i].children.length) {
                    li.classList.add('has-children')
                }
                ul.appendChild(li)
            }
            menu.appendChild(ul)
            this.dropdownWrap.appendChild(menu)
            this.calcDropdownWidth()
        }

        // 计算下拉面板宽度
        Cascade.prototype.calcDropdownWidth = function() {
            this.dropdownWrap.style.width = (180 * (this.dropdownWrap.children.length || 1)) + 'px'
        }

        // 选中
        Cascade.prototype.onChange = function() {
            var _this = this
            var data = []
            var labels = []
            for(var i = 0; i < _this.dropdownWrap.children.length; i++) {
                var lis = _this.dropdownWrap.children[i].getElementsByTagName('ul')[0].children
                for(var j = 0; j < lis.length; j++) {
                    var isChecked = lis[j].getAttribute('_checked')
                    if(isChecked) {
                        var value = lis[j].getAttribute('_value')
                        var label = lis[j].getElementsByTagName('span')[0].innerHTML
                        data.push(value)
                        labels.push(label)
                    }
                }
            }
            this.selectedData = data
            this.selectedLabel = labels
            this.renderInputText()
            this.dropdownWrap.style.display = 'none'

            // 触发回调
            if(this.config.onChange && typeof this.config.onChange === 'function') {
                this.config.onChange(data)
            }
        }

        // 生成选中文本
        Cascade.prototype.renderInputText = function() {
            var text = ''
            if(this.showBreadcrumb)
                text = this.selectedLabel.join(' / ')
            else
                text = this.selectedLabel[this.selectedLabel.length - 1]
            this.inputWrap.children[0].value = text
        }

        /**
         * 获取value
         * @return { Array } data数组
        */
        Cascade.prototype.getValue = function() {
            return this.selectedData
        }

        /**
         * 设置value
         * @param { Array } data data数组
         * @return { Null } null
        */
        Cascade.prototype.setValue = function(data) {
            if(this.disable) return
            if(data instanceof Array) {
                var labels = []
                getLabels(this.data, 0)
                console.log(labels)
                this.selectedLabel = labels
                this.selectedData = data
                this.renderInputText()
            }

            function getLabels(menus, i) {
                menus.forEach(function(item) {
                    if(item.value === data[i]) {
                        labels.push(item.label)
                        if(item.children && item.children instanceof Array) {
                            return getLabels(item.children, i + 1)
                        }
                    }
                })
            }
        }

        // 禁用
        Cascade.prototype.handleDisable = function(disable) {
            this.disable = disable
            this.renderDisable()
        }

        // 禁用状态渲染
        Cascade.prototype.renderDisable = function() {
            if(this.disable) {
                var input = this.inputWrap.getElementsByTagName('input')[0]
                input.setAttribute('disable', 'disable')
                input.classList.add('disable')
            } else {
                var input = this.inputWrap.getElementsByTagName('input')[0]
                input.removeAttribute('disable')
                input.classList.remove('disable')
            }
        }

        /**
         * 获取禁用状态
         * @return { Boolean } 禁用状态
        */
        Cascade.prototype.getStatus = function() {
            return this.disable
        }

        // 搜索框输入
        Cascade.prototype.onInputChange = function(val, level) {
            var _this =this
            // 移除当前面板的后续面板
            for(var j = level + 1; j < _this.dropdownWrap.childNodes.length; j++) {
                _this.dropdownWrap.removeChild(_this.dropdownWrap.childNodes[j])
                j--
            }
            _this.calcDropdownWidth()

            var lis = this.dropdownWrap.children[level].getElementsByTagName('ul')[0].children
            for(var i = 0; i < lis.length; i++) {
                var value = lis[i].getElementsByTagName('span')[0].innerHTML
                if(value.indexOf(val) < 0) {
                    lis[i].style.display = 'none'
                } else {
                    lis[i].style.display = 'block'
                }
            }
        }

        return Cascade
    }()
    
    window.myCascade = myCascade

    function debounce(fn, wait) {
        var timeout = null
        return function() {
            if(timeout !== null) 
                clearTimeout(timeout)
            timeout = setTimeout(fn, wait); 
        }
    }
})(window)