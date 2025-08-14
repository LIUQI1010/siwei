import React from 'react'
import { Outlet } from 'react-router-dom'

export default function AuthLayout(){
  return (
    <div style={{ minHeight:'100vh', display:'grid', placeItems:'center' }}>
      <div style={{ width: 420, background:'#fff', padding:24, borderRadius:12 }}>
        <Outlet />
      </div>
    </div>
  )
}
