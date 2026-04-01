import { useState, useEffect, useRef, useCallback } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Users, DollarSign, Settings, Plus, Edit, Trash2, Eye, Search, Upload, LogOut, Shield, CheckCircle, X, Save, RefreshCw, Download, AlertTriangle, UserPlus, FileText, ToggleLeft, ToggleRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { coursesAPI, studentsAPI, trainersAPI, materialsAPI, adminAPI, enrollmentsAPI, paymentsAPI, getError } from '../utils/api'
import { Badge, Spinner } from '../components/shared'
import EnrollmentManager from './EnrollmentManager'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import toast from 'react-hot-toast'

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-card p-6 max-w-sm w-full border border-red-500/30">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={22} className="text-red-400 flex-shrink-0" />
          <p className="text-white font-semibold">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-ghost text-sm py-2 px-4">Cancel</button>
          <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-xl text-sm">Delete</button>
        </div>
      </div>
    </div>
  )
}

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 pt-16">
      <div className={`glass-card border border-dark-border w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} my-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h2 className="text-white font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"><X size={20}/></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function FormField({ label, required, children, hint }) {
  return (
    <div>
      <label className="text-gray-400 text-sm font-medium mb-1.5 flex items-center gap-1">
        {label}{required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-gray-600 text-xs mt-1">{hint}</p>}
    </div>
  )
}

function EmptyState({ icon, title, sub }) {
  return (
    <div className="glass-card py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{sub}</p>
    </div>
  )
}

const inputCls = 'input-field text-sm py-2.5'
const CATEGORIES = ['cybersecurity','networking','aws','gcp','vmware','nutanix','firewall','datacenter','hardware']
const LEVELS = ['Beginner','Intermediate','Advanced']
const REVENUE_DATA = [{m:'Sep',v:125000},{m:'Oct',v:148000},{m:'Nov',v:162000},{m:'Dec',v:185000},{m:'Jan',v:220000},{m:'Feb',v:198000},{m:'Mar',v:245000}]
const ENROLL_DATA  = [{m:'Sep',v:45},{m:'Oct',v:62},{m:'Nov',v:58},{m:'Dec',v:78},{m:'Jan',v:92},{m:'Feb',v:85},{m:'Mar',v:105}]

export default function AdminPanel() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const links = [
    { path:'/admin',             icon:<LayoutDashboard size={18}/>, label:'Dashboard',   exact:true },
    { path:'/admin/courses',     icon:<BookOpen size={18}/>,        label:'Courses' },
    { path:'/admin/students',    icon:<Users size={18}/>,           label:'Students' },
    { path:'/admin/trainers',    icon:<UserPlus size={18}/>,        label:'Trainers' },
    { path:'/admin/enrollments', icon:<CheckCircle size={18}/>,     label:'Enrollments', badge: true },
    { path:'/admin/payments',    icon:<DollarSign size={18}/>,      label:'Payments' },
    { path:'/admin/materials',   icon:<FileText size={18}/>,        label:'Materials' },
  ]
  const isActive = (p, exact) => exact ? location.pathname === p : location.pathname.startsWith(p) && location.pathname !== '/admin'
  return (
    <div className="min-h-screen bg-dark flex">
      <aside className="w-64 bg-dark-50 border-r border-dark-border flex flex-col fixed h-full z-40 hidden md:flex">
        <div className="p-5 border-b border-dark-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><Shield size={16} className="text-dark"/></div>
            <span className="text-white font-display text-lg tracking-wide">ADMIN <span className="text-primary">PANEL</span></span>
          </Link>
        </div>
        <div className="p-4 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-dark font-bold">{user?.name?.charAt(0)}</div>
            <div><p className="text-white font-semibold text-sm">{user?.name?.split(' ')[0]}</p><Badge color="yellow">Administrator</Badge></div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(l => <Link key={l.path} to={l.path} className={isActive(l.path,l.exact)?'sidebar-link-active':'sidebar-link'}>{l.icon} {l.label}</Link>)}
          <div className="pt-4 border-t border-dark-border"><Link to="/student" className="sidebar-link text-cyan-400"><Eye size={18}/> Student View</Link></div>
        </nav>
        <div className="p-4 border-t border-dark-border">
          <button onClick={()=>{logout();navigate('/')}} className="sidebar-link text-red-400 hover:bg-red-500/10 w-full"><LogOut size={18}/> Logout</button>
        </div>
      </aside>
      <main className="md:ml-64 flex-1 p-6 pt-8 overflow-x-hidden min-h-screen">
        <Routes>
          <Route path="/"            element={<AdminDashboard/>} />
          <Route path="/courses"     element={<AdminCourses/>} />
          <Route path="/students"    element={<AdminStudents/>} />
          <Route path="/trainers"    element={<AdminTrainers/>} />
          <Route path="/enrollments" element={<EnrollmentManager/>} />
          <Route path="/payments"    element={<AdminPayments/>} />
          <Route path="/materials"   element={<AdminMaterials/>} />
        </Routes>
      </main>
    </div>
  )
}

// ── DASHBOARD ────────────────────────────────────────────────
function AdminDashboard() {
  const [stats,setStats]=useState(null)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    adminAPI.getDashboardStats()
      .then(r=>setStats(r.data.stats))
      .catch(()=>setStats({totalStudents:0,totalCourses:0,totalEnrollments:0,totalRevenue:0,recentEnrollments:[]}))
      .finally(()=>setLoading(false))
  },[])
  const kpis=[
    {icon:'🎓',label:'Total Students',   value:stats?.totalStudents??'—',   change:'+12%',color:'text-primary'},
    {icon:'📚',label:'Active Courses',   value:stats?.totalCourses??'—',    change:'+2',  color:'text-cyan-400'},
    {icon:'💰',label:'Revenue',          value:stats?.totalRevenue?`₹${(stats.totalRevenue/1000).toFixed(0)}k`:'—', change:'+18%',color:'text-green-400'},
    {icon:'📈',label:'Enrollments',      value:stats?.totalEnrollments??'—',change:'+23%',color:'text-purple-400'},
  ]
  return (
    <div>
      <div className="mb-6"><h1 className="text-3xl font-display text-white tracking-wide">Admin <span className="text-primary">Dashboard</span></h1></div>
      {loading?<div className="flex justify-center py-16"><Spinner size="lg"/></div>:(
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((k,i)=>(
              <div key={i} className="glass-card p-5">
                <div className="flex justify-between mb-3"><span className="text-2xl">{k.icon}</span><span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{k.change}</span></div>
                <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                <div className="text-gray-400 text-sm mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="glass-card p-5">
              <h3 className="text-white font-semibold mb-4 text-sm">Revenue Trend (₹)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={REVENUE_DATA}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E"/>
                  <XAxis dataKey="m" tick={{fill:'#6B7280',fontSize:11}}/><YAxis tick={{fill:'#6B7280',fontSize:11}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                  <Tooltip contentStyle={{background:'#12121A',border:'1px solid #2A2A3E',borderRadius:10,fontSize:12}}/>
                  <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F5C518" stopOpacity={0.3}/><stop offset="95%" stopColor="#F5C518" stopOpacity={0}/></linearGradient></defs>
                  <Area type="monotone" dataKey="v" stroke="#F5C518" fill="url(#rg)" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card p-5">
              <h3 className="text-white font-semibold mb-4 text-sm">Monthly Enrollments</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={ENROLL_DATA}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E"/>
                  <XAxis dataKey="m" tick={{fill:'#6B7280',fontSize:11}}/><YAxis tick={{fill:'#6B7280',fontSize:11}}/>
                  <Tooltip contentStyle={{background:'#12121A',border:'1px solid #2A2A3E',borderRadius:10,fontSize:12}}/>
                  <Bar dataKey="v" fill="#00D4FF" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Recent Enrollments</h3>
            {stats?.recentEnrollments?.length>0?(
              <div className="overflow-x-auto">
                <table className="admin-table"><thead><tr><th>Student</th><th>Course</th><th>Date</th></tr></thead>
                  <tbody>{stats.recentEnrollments.slice(0,8).map((e,i)=>(
                    <tr key={i}><td className="text-white font-medium text-sm">{e.user?.name||'—'}</td><td className="text-gray-300 text-sm">{e.course?.title||'—'}</td><td className="text-gray-500 text-xs">{e.enrolledAt?new Date(e.enrolledAt).toLocaleDateString():'—'}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            ):<p className="text-gray-500 text-sm text-center py-6">No enrollments yet</p>}
          </div>
        </>
      )}
    </div>
  )
}

// ── COURSES CRUD ─────────────────────────────────────────────
const BLANK_COURSE={title:'',description:'',shortDescription:'',category:'cybersecurity',level:'Beginner',price:'',discountPrice:'',duration:'',tags:'',whatYouLearn:'',requirements:'',isFeatured:false,isPublished:true,certificationIncluded:true}

function AdminCourses() {
  const [courses,setCourses]=useState([])
  const [loading,setLoading]=useState(true)
  const [search,setSearch]=useState('')
  const [showModal,setShowModal]=useState(false)
  const [editing,setEditing]=useState(null)
  const [form,setForm]=useState(BLANK_COURSE)
  const [saving,setSaving]=useState(false)
  const [confirm,setConfirm]=useState(null)

  const load=useCallback(async()=>{
    setLoading(true)
    try{const r=await coursesAPI.getAllAdmin();setCourses(r.data.courses||[])}
    catch(err){toast.error(getError(err))}
    finally{setLoading(false)}
  },[])
  useEffect(()=>{load()},[load])

  const openCreate=()=>{setForm(BLANK_COURSE);setEditing(null);setShowModal(true)}
  const openEdit=(c)=>{
    setForm({title:c.title||'',description:c.description||'',shortDescription:c.shortDescription||'',category:c.category||'cybersecurity',level:c.level||'Beginner',price:c.price||'',discountPrice:c.discountPrice||'',duration:c.duration||'',tags:Array.isArray(c.tags)?c.tags.join(', '):(c.tags||''),whatYouLearn:Array.isArray(c.whatYouLearn)?c.whatYouLearn.join('\n'):'',requirements:Array.isArray(c.requirements)?c.requirements.join('\n'):'',isFeatured:c.isFeatured||false,isPublished:c.isPublished!==false,certificationIncluded:c.certificationIncluded!==false})
    setEditing(c);setShowModal(true)
  }

  const handleSave=async()=>{
    if(!form.title.trim()||!form.price){toast.error('Title and Price are required');return}
    setSaving(true)
    try{
      const payload={...form,whatYouLearn:form.whatYouLearn.split('\n').map(s=>s.trim()).filter(Boolean),requirements:form.requirements.split('\n').map(s=>s.trim()).filter(Boolean)}
      if(editing){const r=await coursesAPI.update(editing._id,payload);setCourses(prev=>prev.map(c=>c._id===editing._id?r.data.course:c));toast.success('✅ Course updated!')}
      else{const r=await coursesAPI.create(payload);setCourses(prev=>[r.data.course,...prev]);toast.success('✅ Course created!')}
      setShowModal(false)
    }catch(err){toast.error(getError(err))}
    finally{setSaving(false)}
  }

  const handleDelete=async(id)=>{
    try{await coursesAPI.delete(id);setCourses(prev=>prev.filter(c=>c._id!==id));toast.success('🗑️ Course deleted')}
    catch(err){toast.error(getError(err))}
    finally{setConfirm(null)}
  }

  const filtered=courses.filter(c=>!search||c.title?.toLowerCase().includes(search.toLowerCase())||c.category?.toLowerCase().includes(search.toLowerCase()))
  const f=(key)=>(e)=>setForm(p=>({...p,[key]:e.target.type==='checkbox'?e.target.checked:e.target.value}))

  return (
    <div>
      {confirm&&<ConfirmDialog message="Permanently delete this course? This cannot be undone." onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)}/>}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-white">Manage Courses</h1><p className="text-gray-500 text-sm">{courses.length} total</p></div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost text-sm py-2.5 px-3"><RefreshCw size={15}/></button>
          <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"><Plus size={16}/> Add Course</button>
        </div>
      </div>
      <div className="relative mb-4"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search courses…" className="input-field pl-11 text-sm"/></div>
      {loading?<div className="flex justify-center py-16"><Spinner size="lg"/></div>:filtered.length===0?<EmptyState icon="📚" title="No courses found" sub={search?'Try a different search':'Add your first course'}/>:(
        <div className="glass-card overflow-hidden"><div className="overflow-x-auto">
          <table className="admin-table">
            <thead><tr><th>Course</th><th>Category</th><th>Level</th><th>Price</th><th>Students</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(c=>(
              <tr key={c._id}>
                <td><p className="text-white font-semibold text-sm">{c.title}</p><p className="text-gray-500 text-xs">{c.duration||'—'}</p></td>
                <td><span className="tag-pill capitalize text-xs">{c.category}</span></td>
                <td><span className="tag-pill text-xs">{c.level}</span></td>
                <td><p className="text-primary font-bold text-sm">₹{(c.discountPrice||c.price)?.toLocaleString()}</p>{c.discountPrice&&<p className="text-gray-500 line-through text-xs">₹{c.price?.toLocaleString()}</p>}</td>
                <td className="text-gray-300 text-sm">{c.enrolledCount||0}</td>
                <td><span className={`tag-pill text-xs ${c.isPublished?'text-green-400 border-green-400/30':'text-gray-500'}`}>{c.isPublished?'Published':'Draft'}</span></td>
                <td><div className="flex gap-1.5">
                  <button onClick={()=>openEdit(c)} className="p-1.5 hover:bg-primary/20 rounded-lg text-primary"><Edit size={14}/></button>
                  <button onClick={()=>setConfirm(c._id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 size={14}/></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div></div>
      )}
      {showModal&&(
        <Modal title={editing?'Edit Course':'Add New Course'} onClose={()=>setShowModal(false)} wide>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><FormField label="Course Title" required><input value={form.title} onChange={f('title')} className={inputCls} placeholder="e.g. Complete AWS Solutions Architect"/></FormField></div>
            <div className="sm:col-span-2"><FormField label="Short Description"><input value={form.shortDescription} onChange={f('shortDescription')} className={inputCls} placeholder="One-line summary"/></FormField></div>
            <div className="sm:col-span-2"><FormField label="Full Description"><textarea value={form.description} onChange={f('description')} rows={3} className={`${inputCls} resize-none`}/></FormField></div>
            <FormField label="Category" required><select value={form.category} onChange={f('category')} className={inputCls}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></FormField>
            <FormField label="Level"><select value={form.level} onChange={f('level')} className={inputCls}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></FormField>
            <FormField label="Price (₹)" required><input type="number" value={form.price} onChange={f('price')} className={inputCls} placeholder="25000"/></FormField>
            <FormField label="Discount Price (₹)"><input type="number" value={form.discountPrice} onChange={f('discountPrice')} className={inputCls} placeholder="19999"/></FormField>
            <FormField label="Duration"><input value={form.duration} onChange={f('duration')} className={inputCls} placeholder="60 Days"/></FormField>
            <FormField label="Tags" hint="Comma separated"><input value={form.tags} onChange={f('tags')} className={inputCls} placeholder="CCNA, Cisco, Routing"/></FormField>
            <div className="sm:col-span-2"><FormField label="What You'll Learn" hint="One item per line"><textarea value={form.whatYouLearn} onChange={f('whatYouLearn')} rows={3} className={`${inputCls} resize-none`} placeholder="Master subnetting&#10;Configure VLANs"/></FormField></div>
            <div className="sm:col-span-2"><FormField label="Requirements" hint="One item per line"><textarea value={form.requirements} onChange={f('requirements')} rows={2} className={`${inputCls} resize-none`} placeholder="Basic networking&#10;Laptop 8GB RAM"/></FormField></div>
            <div className="sm:col-span-2 flex gap-6 flex-wrap">
              {[['isPublished','Published'],['isFeatured','Featured'],['certificationIncluded','Certificate Included']].map(([key,label])=>(
                <label key={key} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form[key]} onChange={f(key)} className="w-4 h-4 accent-primary"/><span className="text-gray-300 text-sm">{label}</span></label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button onClick={()=>setShowModal(false)} className="btn-ghost text-sm py-2.5 px-5">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2">
              {saving?<><Spinner size="sm"/> Saving…</>:<><Save size={15}/> {editing?'Update Course':'Create Course'}</>}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── STUDENTS CRUD ────────────────────────────────────────────
const BLANK_STUDENT={name:'',email:'',phone:'',password:'Student@123'}

function AdminStudents() {
  const [students,setStudents]=useState([])
  const [loading,setLoading]=useState(true)
  const [search,setSearch]=useState('')
  const [showModal,setShowModal]=useState(false)
  const [editing,setEditing]=useState(null)
  const [form,setForm]=useState(BLANK_STUDENT)
  const [saving,setSaving]=useState(false)
  const [confirm,setConfirm]=useState(null)

  const load=useCallback(async()=>{
    setLoading(true)
    try{const r=await studentsAPI.getAll();setStudents(r.data.students||[])}
    catch(err){toast.error(getError(err))}
    finally{setLoading(false)}
  },[])
  useEffect(()=>{load()},[load])

  const openCreate=()=>{setForm(BLANK_STUDENT);setEditing(null);setShowModal(true)}
  const openEdit=(s)=>{setForm({name:s.name,email:s.email,phone:s.phone||'',password:''});setEditing(s);setShowModal(true)}

  const handleSave=async()=>{
    if(!form.name.trim()||!form.email.trim()){toast.error('Name and email required');return}
    setSaving(true)
    try{
      if(editing){const{password,...up}=form;const r=await studentsAPI.update(editing._id,up);setStudents(prev=>prev.map(s=>s._id===editing._id?r.data.student:s));toast.success('✅ Student updated!')}
      else{const r=await studentsAPI.create(form);setStudents(prev=>[r.data.student,...prev]);toast.success('✅ Student created!')}
      setShowModal(false)
    }catch(err){toast.error(getError(err))}
    finally{setSaving(false)}
  }

  const handleDelete=async(id)=>{
    try{await studentsAPI.delete(id);setStudents(prev=>prev.filter(s=>s._id!==id));toast.success('🗑️ Student deleted')}
    catch(err){toast.error(getError(err))}
    finally{setConfirm(null)}
  }

  const handleToggle=async(id)=>{
    try{const r=await studentsAPI.toggleStatus(id);setStudents(prev=>prev.map(s=>s._id===id?{...s,isActive:r.data.isActive}:s));toast.success(r.data.message)}
    catch(err){toast.error(getError(err))}
  }

  const filtered=students.filter(s=>!search||s.name?.toLowerCase().includes(search.toLowerCase())||s.email?.toLowerCase().includes(search.toLowerCase()))
  const f=(key)=>(e)=>setForm(p=>({...p,[key]:e.target.value}))

  return (
    <div>
      {confirm&&<ConfirmDialog message="Delete this student? All enrollments will also be removed." onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)}/>}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-white">Manage Students</h1><p className="text-gray-500 text-sm">{students.length} registered</p></div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost text-sm py-2.5 px-3"><RefreshCw size={15}/></button>
          <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"><Plus size={16}/> Add Student</button>
        </div>
      </div>
      <div className="relative mb-4"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email…" className="input-field pl-11 text-sm"/></div>
      {loading?<div className="flex justify-center py-16"><Spinner size="lg"/></div>:filtered.length===0?<EmptyState icon="👥" title="No students found" sub={search?'Try a different search':'Add your first student'}/>:(
        <div className="glass-card overflow-hidden"><div className="overflow-x-auto">
          <table className="admin-table">
            <thead><tr><th>Student</th><th>Phone</th><th>Courses</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(s=>(
              <tr key={s._id}>
                <td><div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">{s.name?.charAt(0).toUpperCase()}</div>
                  <div><p className="text-white font-semibold text-sm">{s.name}</p><p className="text-gray-500 text-xs">{s.email}</p></div>
                </div></td>
                <td className="text-gray-300 text-sm">{s.phone||'—'}</td>
                <td><span className="tag-pill text-xs">{s.enrolledCourses?.length||0} courses</span></td>
                <td className="text-gray-500 text-xs">{s.createdAt?new Date(s.createdAt).toLocaleDateString():'—'}</td>
                <td><button onClick={()=>handleToggle(s._id)} className={`flex items-center gap-1.5 text-xs font-semibold ${s.isActive?'text-green-400':'text-gray-500'}`}>{s.isActive?<ToggleRight size={18}/>:<ToggleLeft size={18}/>}{s.isActive?'Active':'Inactive'}</button></td>
                <td><div className="flex gap-1.5">
                  <button onClick={()=>openEdit(s)} className="p-1.5 hover:bg-primary/20 rounded-lg text-primary"><Edit size={14}/></button>
                  <button onClick={()=>setConfirm(s._id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 size={14}/></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div></div>
      )}
      {showModal&&(
        <Modal title={editing?'Edit Student':'Add New Student'} onClose={()=>setShowModal(false)}>
          <div className="space-y-4">
            <FormField label="Full Name" required><input value={form.name} onChange={f('name')} className={inputCls} placeholder="e.g. Karthik Rajan"/></FormField>
            <FormField label="Email Address" required><input type="email" value={form.email} onChange={f('email')} className={inputCls} placeholder="student@gmail.com" disabled={!!editing}/>{editing&&<p className="text-gray-600 text-xs mt-1">Email cannot be changed</p>}</FormField>
            <FormField label="Phone Number"><input value={form.phone} onChange={f('phone')} className={inputCls} placeholder="+91 98765 43210"/></FormField>
            {!editing&&<FormField label="Initial Password" hint="Student can change after first login"><input value={form.password} onChange={f('password')} className={inputCls} placeholder="Student@123"/></FormField>}
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button onClick={()=>setShowModal(false)} className="btn-ghost text-sm py-2.5 px-5">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2">
              {saving?<><Spinner size="sm"/> Saving…</>:<><Save size={15}/> {editing?'Update Student':'Create Student'}</>}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── TRAINERS CRUD ────────────────────────────────────────────
const BLANK_TRAINER={name:'',email:'',phone:'',designation:'',experience:'',bio:'',specializations:'',certifications:'',linkedIn:''}

function AdminTrainers() {
  const [trainers,setTrainers]=useState([])
  const [loading,setLoading]=useState(true)
  const [search,setSearch]=useState('')
  const [showModal,setShowModal]=useState(false)
  const [editing,setEditing]=useState(null)
  const [form,setForm]=useState(BLANK_TRAINER)
  const [saving,setSaving]=useState(false)
  const [confirm,setConfirm]=useState(null)

  const load=useCallback(async()=>{
    setLoading(true)
    try{const r=await trainersAPI.getAllAdmin();setTrainers(r.data.trainers||[])}
    catch(err){toast.error(getError(err))}
    finally{setLoading(false)}
  },[])
  useEffect(()=>{load()},[load])

  const openCreate=()=>{setForm(BLANK_TRAINER);setEditing(null);setShowModal(true)}
  const openEdit=(t)=>{setForm({name:t.name||'',email:t.email||'',phone:t.phone||'',designation:t.designation||'',experience:t.experience||'',bio:t.bio||'',specializations:Array.isArray(t.specializations)?t.specializations.join(', '):'',certifications:Array.isArray(t.certifications)?t.certifications.join(', '):'',linkedIn:t.linkedIn||''});setEditing(t);setShowModal(true)}

  const handleSave=async()=>{
    if(!form.name.trim()){toast.error('Trainer name is required');return}
    setSaving(true)
    try{
      if(editing){const r=await trainersAPI.update(editing._id,form);setTrainers(prev=>prev.map(t=>t._id===editing._id?r.data.trainer:t));toast.success('✅ Trainer updated!')}
      else{const r=await trainersAPI.create(form);setTrainers(prev=>[r.data.trainer,...prev]);toast.success('✅ Trainer created!')}
      setShowModal(false)
    }catch(err){toast.error(getError(err))}
    finally{setSaving(false)}
  }

  const handleDelete=async(id)=>{
    try{await trainersAPI.delete(id);setTrainers(prev=>prev.filter(t=>t._id!==id));toast.success('🗑️ Trainer deleted')}
    catch(err){toast.error(getError(err))}
    finally{setConfirm(null)}
  }

  const filtered=trainers.filter(t=>!search||t.name?.toLowerCase().includes(search.toLowerCase()))
  const f=(key)=>(e)=>setForm(p=>({...p,[key]:e.target.value}))

  return (
    <div>
      {confirm&&<ConfirmDialog message="Delete this trainer?" onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)}/>}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-white">Manage Trainers</h1><p className="text-gray-500 text-sm">{trainers.length} trainers</p></div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost text-sm py-2.5 px-3"><RefreshCw size={15}/></button>
          <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"><Plus size={16}/> Add Trainer</button>
        </div>
      </div>
      <div className="relative mb-4"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search trainers…" className="input-field pl-11 text-sm"/></div>
      {loading?<div className="flex justify-center py-16"><Spinner size="lg"/></div>:filtered.length===0?<EmptyState icon="👨‍🏫" title="No trainers found" sub="Add your first trainer"/>:(
        <div className="grid sm:grid-cols-2 gap-5">{filtered.map(t=>(
          <div key={t._id} className="glass-card p-5 hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary font-bold text-xl flex items-center justify-center">{t.name?.charAt(0)}</div>
                <div><p className="text-white font-bold">{t.name}</p><p className="text-primary text-xs font-medium">{t.designation||'—'}</p><p className="text-gray-500 text-xs">{t.experience||'—'}</p></div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={()=>openEdit(t)} className="p-1.5 hover:bg-primary/20 rounded-lg text-primary"><Edit size={14}/></button>
                <button onClick={()=>setConfirm(t._id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 size={14}/></button>
              </div>
            </div>
            {t.bio&&<p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{t.bio}</p>}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3"><span>⭐ {t.rating||4.5}</span><span>👥 {t.studentsCount||0} students</span><span className={t.isActive?'text-green-400':'text-gray-600'}>{t.isActive?'● Active':'● Inactive'}</span></div>
            {t.certifications?.length>0&&<div className="flex flex-wrap gap-1.5">{t.certifications.slice(0,4).map(c=><span key={c} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-xs">{c}</span>)}</div>}
          </div>
        ))}</div>
      )}
      {showModal&&(
        <Modal title={editing?'Edit Trainer':'Add New Trainer'} onClose={()=>setShowModal(false)} wide>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Full Name" required><input value={form.name} onChange={f('name')} className={inputCls} placeholder="e.g. Rajesh Kumar"/></FormField>
            <FormField label="Email"><input type="email" value={form.email} onChange={f('email')} className={inputCls} placeholder="trainer@institute.com"/></FormField>
            <FormField label="Phone"><input value={form.phone} onChange={f('phone')} className={inputCls} placeholder="+91 98765 43210"/></FormField>
            <FormField label="Designation"><input value={form.designation} onChange={f('designation')} className={inputCls} placeholder="Senior Security Engineer"/></FormField>
            <FormField label="Experience"><input value={form.experience} onChange={f('experience')} className={inputCls} placeholder="12+ Years"/></FormField>
            <FormField label="LinkedIn URL"><input value={form.linkedIn} onChange={f('linkedIn')} className={inputCls} placeholder="https://linkedin.com/in/…"/></FormField>
            <div className="sm:col-span-2"><FormField label="Bio"><textarea value={form.bio} onChange={f('bio')} rows={3} className={`${inputCls} resize-none`} placeholder="Expert in penetration testing…"/></FormField></div>
            <FormField label="Specializations" hint="Comma separated"><input value={form.specializations} onChange={f('specializations')} className={inputCls} placeholder="Cyber Security, Ethical Hacking"/></FormField>
            <FormField label="Certifications" hint="Comma separated"><input value={form.certifications} onChange={f('certifications')} className={inputCls} placeholder="CISSP, CEH, OSCP"/></FormField>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button onClick={()=>setShowModal(false)} className="btn-ghost text-sm py-2.5 px-5">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2">
              {saving?<><Spinner size="sm"/> Saving…</>:<><Save size={15}/> {editing?'Update Trainer':'Create Trainer'}</>}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── MATERIALS CRUD ───────────────────────────────────────────
function AdminMaterials() {
  const [materials,setMaterials]=useState([])
  const [loading,setLoading]=useState(true)
  const [uploading,setUploading]=useState(false)
  const [confirm,setConfirm]=useState(null)
  const [showForm,setShowForm]=useState(false)
  const [courses,setCourses]=useState([])
  const fileRef=useRef(null)
  const [form,setForm]=useState({title:'',description:'',courseId:'',module:'',order:'',isPublic:false,fileUrl:''})
  const [selectedFile,setSelectedFile]=useState(null)
  const [search,setSearch]=useState('')

  const load=useCallback(async()=>{
    setLoading(true)
    try{
      const [mr,cr]=await Promise.all([materialsAPI.getAll(),coursesAPI.getAllAdmin()])
      setMaterials(mr.data.materials||[]);setCourses(cr.data.courses||[])
    }catch(err){toast.error(getError(err))}
    finally{setLoading(false)}
  },[])
  useEffect(()=>{load()},[load])

  const handleUpload=async(e)=>{
    e.preventDefault()
    if(!form.title.trim()){toast.error('Title is required');return}
    if(!selectedFile&&!form.fileUrl.trim()){toast.error('Select a file or enter a URL');return}
    setUploading(true)
    try{
      const fd=new FormData()
      Object.entries(form).forEach(([k,v])=>{if(v!=='')fd.append(k,v)})
      if(selectedFile)fd.append('file',selectedFile)
      const r=await materialsAPI.upload(fd)
      setMaterials(prev=>[r.data.material,...prev])
      toast.success('✅ Material uploaded!')
      setShowForm(false);setForm({title:'',description:'',courseId:'',module:'',order:'',isPublic:false,fileUrl:''});setSelectedFile(null)
    }catch(err){toast.error(getError(err))}
    finally{setUploading(false)}
  }

  const handleDelete=async(id)=>{
    try{await materialsAPI.delete(id);setMaterials(prev=>prev.filter(m=>m._id!==id));toast.success('🗑️ Material deleted')}
    catch(err){toast.error(getError(err))}
    finally{setConfirm(null)}
  }

  const handleDownload=(id,fileName)=>{
    const url=materialsAPI.getDownloadUrl(id)
    const token=localStorage.getItem('cybertech_token')
    fetch(url,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.blob()).then(blob=>{
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fileName||'download';a.click();URL.revokeObjectURL(a.href)
    }).catch(()=>toast.error('Download failed'))
  }

  const typeIcon={pdf:'📄',video:'🎬',ppt:'📊',zip:'📦',link:'🔗',other:'📁'}
  const typeColor={pdf:'text-red-400 bg-red-400/10 border-red-400/20',video:'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',ppt:'text-orange-400 bg-orange-400/10 border-orange-400/20',zip:'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',link:'text-blue-400 bg-blue-400/10 border-blue-400/20',other:'text-gray-400 bg-gray-400/10 border-gray-400/20'}
  const filtered=materials.filter(m=>!search||m.title?.toLowerCase().includes(search.toLowerCase()))
  const f=(key)=>(e)=>setForm(p=>({...p,[key]:e.target.type==='checkbox'?e.target.checked:e.target.value}))

  return (
    <div>
      {confirm&&<ConfirmDialog message="Delete this material? The file will be permanently removed." onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)}/>}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-white">Course Materials</h1><p className="text-gray-500 text-sm">{materials.length} total files</p></div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost text-sm py-2.5 px-3"><RefreshCw size={15}/></button>
          <button onClick={()=>setShowForm(!showForm)} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"><Upload size={16}/> Upload Material</button>
        </div>
      </div>

      {showForm&&(
        <div className="glass-card p-6 mb-6 border border-primary/30">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Upload size={16} className="text-primary"/> Upload New Material</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Title" required><input value={form.title} onChange={f('title')} className={inputCls} placeholder="e.g. Module 1 — PDF Notes"/></FormField>
              <FormField label="Linked Course"><select value={form.courseId} onChange={f('courseId')} className={inputCls}><option value="">— No specific course —</option>{courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}</select></FormField>
              <FormField label="Module / Section"><input value={form.module} onChange={f('module')} className={inputCls} placeholder="Module 1"/></FormField>
              <FormField label="Sort Order"><input type="number" value={form.order} onChange={f('order')} className={inputCls} placeholder="1"/></FormField>
              <div className="sm:col-span-2"><FormField label="Description"><input value={form.description} onChange={f('description')} className={inputCls}/></FormField></div>
            </div>
            <div className="border border-dark-border rounded-xl overflow-hidden">
              <div className="border-2 border-dashed border-dark-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all" onClick={()=>fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();setSelectedFile(e.dataTransfer.files[0])}}>
                <input type="file" ref={fileRef} className="hidden" onChange={e=>setSelectedFile(e.target.files[0])} accept=".pdf,.ppt,.pptx,.zip,.mp4,.webm,.doc,.docx,.txt"/>
                {selectedFile?(
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl">📄</span>
                    <div className="text-left"><p className="text-white font-semibold text-sm">{selectedFile.name}</p><p className="text-gray-400 text-xs">{(selectedFile.size/1024/1024).toFixed(2)} MB</p></div>
                    <button type="button" onClick={e=>{e.stopPropagation();setSelectedFile(null)}} className="ml-3 text-gray-500 hover:text-red-400"><X size={16}/></button>
                  </div>
                ):(
                  <><div className="text-4xl mb-3">📤</div><p className="text-white font-medium mb-1">Click to select or drag & drop</p><p className="text-gray-500 text-sm">PDF, PPT, MP4, ZIP, DOC (max 500 MB)</p></>
                )}
              </div>
              <div className="p-3 bg-dark/40 border-t border-dark-border">
                <FormField label="Or paste an external URL"><input value={form.fileUrl} onChange={f('fileUrl')} className={inputCls} placeholder="https://youtube.com/watch?v=…" disabled={!!selectedFile}/></FormField>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isPublic} onChange={f('isPublic')} className="w-4 h-4 accent-primary"/><span className="text-gray-300 text-sm">Make publicly accessible</span></label>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={()=>setShowForm(false)} className="btn-ghost text-sm py-2.5 px-5">Cancel</button>
              <button type="submit" disabled={uploading} className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2">
                {uploading?<><Spinner size="sm"/> Uploading…</>:<><Upload size={15}/> Upload</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="relative mb-4"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search materials…" className="input-field pl-11 text-sm"/></div>

      {loading?<div className="flex justify-center py-16"><Spinner size="lg"/></div>:filtered.length===0?<EmptyState icon="📂" title="No materials found" sub="Upload your first material"/>:(
        <div className="space-y-3">{filtered.map(m=>(
          <div key={m._id} className="glass-card p-4 flex items-center justify-between gap-4 hover:border-primary/30 transition-all">
            <div className="flex items-center gap-4 min-w-0">
              <span className="text-2xl flex-shrink-0">{typeIcon[m.type]||'📁'}</span>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{m.title}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className={`tag-pill text-xs border ${typeColor[m.type]||typeColor.other}`}>{m.type?.toUpperCase()}</span>
                  {m.fileSize&&<span className="text-gray-500 text-xs">{m.fileSize}</span>}
                  {m.course?.title&&<span className="text-gray-600 text-xs">{m.course.title}</span>}
                  {m.module&&<span className="text-gray-600 text-xs">{m.module}</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={()=>handleDownload(m._id,m.fileName)} className="p-1.5 hover:bg-cyan-500/20 rounded-lg text-cyan-400" title="Download"><Download size={14}/></button>
              <button onClick={()=>setConfirm(m._id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400" title="Delete"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  )
}

// ── ENROLLMENTS (read) ───────────────────────────────────────
function AdminEnrollments() {
  const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true)
  useEffect(()=>{enrollmentsAPI.getAll().then(r=>setRows(r.data.enrollments||[])).catch(err=>toast.error(getError(err))).finally(()=>setLoading(false))},[])
  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-white">Enrollments</h1><p className="text-gray-500 text-sm">{rows.length} total</p></div>
      {loading?<div className="flex justify-center py-16"><Spinner size="lg"/></div>:(
        <div className="glass-card overflow-hidden"><div className="overflow-x-auto">
          <table className="admin-table"><thead><tr><th>Student</th><th>Course</th><th>Enrolled</th><th>Progress</th><th>Status</th></tr></thead>
          <tbody>{rows.length===0?<tr><td colSpan={5} className="text-center text-gray-500 py-10">No enrollments yet</td></tr>:rows.map(e=>(
            <tr key={e._id}>
              <td><p className="text-white font-semibold text-sm">{e.user?.name||'—'}</p><p className="text-gray-500 text-xs">{e.user?.email}</p></td>
              <td className="text-gray-300 text-sm">{e.course?.title||'—'}</td>
              <td className="text-gray-500 text-xs">{e.enrolledAt?new Date(e.enrolledAt).toLocaleDateString():'—'}</td>
              <td><div className="flex items-center gap-2"><div className="progress-bar w-20"><div className="progress-fill" style={{width:`${e.progress||0}%`}}/></div><span className="text-primary text-xs font-bold">{e.progress||0}%</span></div></td>
              <td><span className="tag-pill text-xs text-green-400 border-green-400/30">Active</span></td>
            </tr>
          ))}</tbody></table>
        </div></div>
      )}
    </div>
  )
}

// ── PAYMENTS (read) ──────────────────────────────────────────
function AdminPayments() {
  const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true)
  useEffect(()=>{paymentsAPI.getAll().then(r=>setRows(r.data.payments||[])).catch(err=>toast.error(getError(err))).finally(()=>setLoading(false))},[])
  const total=rows.filter(p=>p.status==='completed').reduce((s,p)=>s+p.amount,0)
  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-white">Payments</h1><p className="text-gray-500 text-sm">{rows.length} transactions</p></div>
        <div className="glass-card px-4 py-2.5 flex items-center gap-3"><span className="text-gray-400 text-sm">Total Revenue:</span><span className="text-primary font-display text-2xl">₹{total.toLocaleString()}</span></div>
      </div>
      {loading?<div className="flex justify-center py-16"><Spinner size="lg"/></div>:(
        <div className="glass-card overflow-hidden"><div className="overflow-x-auto">
          <table className="admin-table"><thead><tr><th>ID</th><th>Student</th><th>Course</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>{rows.length===0?<tr><td colSpan={7} className="text-center text-gray-500 py-10">No payments yet</td></tr>:rows.map(p=>(
            <tr key={p._id}>
              <td className="font-mono text-xs text-gray-500">{p.transactionId?.slice(0,12)||'—'}</td>
              <td><p className="text-white font-semibold text-sm">{p.user?.name||'—'}</p><p className="text-gray-500 text-xs">{p.user?.email}</p></td>
              <td className="text-gray-300 text-sm">{p.course?.title?.slice(0,28)||'—'}</td>
              <td className="text-primary font-bold">₹{p.amount?.toLocaleString()}</td>
              <td><span className="tag-pill text-xs">{p.paymentMethod}</span></td>
              <td className="text-gray-500 text-xs">{p.createdAt?new Date(p.createdAt).toLocaleDateString():'—'}</td>
              <td><span className={`tag-pill text-xs ${p.status==='completed'?'text-green-400 border-green-400/30':p.status==='pending'?'text-yellow-400 border-yellow-400/30':'text-red-400 border-red-400/30'}`}>{p.status}</span></td>
            </tr>
          ))}</tbody></table>
        </div></div>
      )}
    </div>
  )
}
