'use client'

const members = [
  {
    id: '1',
    name: 'Muhammad Sanusi Nasir',
    position: 'Lecturer III',
    department: 'Information Technology',
    bio: 'Muhammad Sanusi Nasir received the B.Sc. degree in Information Technology from NIMS University Jaipur, India, and the M.Sc. degree in Computer Science from Bayero University Kano, Nigeria. He is a researcher with interests spanning information security, explainable artificial intelligence (XAI), and emerging technologies in medicine and healthcare. His research also covers medical informatics and socio-cultural disparities in African and European contexts.',
    email: 'msnasir.international@jspict.edu.ng',
    photo: '/members/muhammad-sanusi.png',
  },
]

export default function MembersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-asup-primary mb-2">Chapter Members</h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">Meet the dedicated academic staff of ASUP Jigawa ICT Kazaure chapter.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(m => (
            <div key={m.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="h-52 bg-blue-100 overflow-hidden">
                {m.photo ? (
                  <img src={m.photo} alt={m.name} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-asup-primary">{m.name.charAt(0)}</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-asup-primary text-base mb-0.5">{m.name}</h3>
                <p className="text-asup-secondary text-xs font-semibold mb-0.5">{m.position}</p>
                <p className="text-gray-400 text-xs mb-3">{m.department}</p>
                <p className="text-gray-600 text-xs leading-relaxed mb-3 line-clamp-4">{m.bio}</p>
                {m.email && (
                  <a href={`mailto:${m.email}`} className="text-xs text-asup-primary hover:underline">✉ {m.email}</a>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 bg-asup-primary rounded-xl p-6 text-center text-white">
          <h3 className="font-bold text-base mb-1">Are you a staff member?</h3>
          <p className="text-gray-300 text-xs mb-4">Fill the form to appear on this page.</p>
          <a href="#" className="bg-asup-secondary text-asup-primary px-5 py-2 rounded font-bold text-xs hover:bg-yellow-400 transition inline-block">Fill Member Profile Form</a>
        </div>
      </div>
    </div>
  )
}
