import React from 'react'
import PropTypes from 'prop-types'
import {FormGroup, ControlLabel, FormControl, Button} from 'react-bootstrap'
import AV from 'leancloud-storage/live-query'

import {getCategoreisTree, depthFirstSearchFind, CategoriesSelect} from './../common'

export default class Category extends React.Component {

  componentDidMount() {
    return getCategoreisTree()
    .then(categoriesTree => {
      const categoryId = this.props.params.id
      return Promise.resolve()
      .then(() => {
        if (categoryId == '_new') {
          return new AV.Object('Category', {
            name: '',
            qTemplate: '',
          })
        }

        return depthFirstSearchFind(categoriesTree, c => c.id == categoryId)
      })
      .then(category => {
        this.setState({
          name: category.get('name'),
          qTemplate: category.get('qTemplate'),
          category,
          parentCategory: category.get('parent'),
          categoriesTree,
          isSubmitting: false,
        })
        return
      })
    })
  }

  handleNameChange(e) {
    this.setState({name: e.target.value})
  }

  handleParentChange(e) {
    const parentCategory = depthFirstSearchFind(this.state.categoriesTree, c => c.id == e.target.value)
    let tmp = parentCategory
    while (tmp) {
      if (tmp.id == this.state.category.id) {
        alert('父分类不能是分类自己或自己的子分类。')
        return false
      }
      tmp = tmp.parent
    }
    this.setState({parentCategory: depthFirstSearchFind(this.state.categoriesTree, c => c.id == e.target.value)})
  }

  handleQTemplateChange(e) {
    this.setState({qTemplate: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault()
    this.setState({isSubmitting: true})
    const category = this.state.category
    if (!this.state.parentCategory) {
      category.unset('parent')
    } else {
      category.set('parent', this.state.parentCategory)
    }
    return category.save({
      name: this.state.name,
      qTemplate: this.state.qTemplate,
    })
    .then(() => {
      this.setState({isSubmitting: false})
      this.context.router.push('/settings/categories')
      return
    })
    .then(this.context.addNotification)
  }

  handleDelete() {
    if (this.state.category.children.length > 0) {
      alert('该分类有子分类，不能删除。')
      return false
    }

    const result = confirm('确认要停用分类：' + this.state.category.get('name'))
    if (result) {
      return this.state.category.destroy()
      .then(() => {
        this.context.router.push('/settings/categories')
        return
      })
      .catch(this.context.addNotification)
    }
  }

  render() {
    if (!this.state) {
      return <div>数据读取中……</div>
    }

    return (
      <div>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <FormGroup controlId="nameText">
            <ControlLabel>分类名称</ControlLabel>
            <FormControl type="text" value={this.state.name} onChange={this.handleNameChange.bind(this)} />
          </FormGroup>
          <FormGroup controlId="parentSelect">
            <ControlLabel>父分类(可选)</ControlLabel>
            <CategoriesSelect categoriesTree={this.state.categoriesTree}
              selected={this.state.parentCategory}
              onChange={this.handleParentChange.bind(this)}/>
          </FormGroup>
          <FormGroup controlId="qTemplateTextarea">
            <ControlLabel>问题描述模板</ControlLabel>
            <FormControl
              componentClass="textarea"
              placeholder="用户新建该分类工单时，问题描述默认显示这里的内容。"
              rows='8'
              value={this.state.qTemplate}
              onChange={this.handleQTemplateChange.bind(this)}/>
          </FormGroup>
          <Button type='submit' disabled={this.state.isSubmitting} bsStyle='success'>保存</Button>
          {' '}
          {this.state.category.id
            && <Button type='button' bsStyle="danger" onClick={this.handleDelete.bind(this)}>删除</Button>
            || <Button type='button' onClick={() => this.context.router.push('/settings/categories')}>取消</Button>
          }
        </form>
      </div>
    )
  }

}

Category.propTypes = {
  params: PropTypes.object.isRequired,
}

Category.contextTypes = {
  router: PropTypes.object.isRequired,
  addNotification: PropTypes.func.isRequired,
}
