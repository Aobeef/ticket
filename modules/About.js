import React from 'react'
import DocumentTitle from 'react-document-title'

export default function About() {
  return <div>
    <DocumentTitle title='关于 - AobeefTicket' />
    <h1 className='font-logo'>Aobeef Ticket</h1>
    <hr />
    <p>该应用是 <a href='https://www.aobeef.cn/'>全民养牛</a> 的工单系统，为更有效地解决和跟进平台内的技术问题而创建。</p>
    <p>该应用 <a href='https://github.com/aobeef/ticket'>源代码 内部可查阅</a></p>
  </div>
}

About.displayName = 'About'
