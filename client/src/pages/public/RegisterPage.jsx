import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '../../layouts/PublicLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function RegisterPage() {
  const { register, catalog } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+251 9');
  const [location, setLocation] = useState('Addis Ababa');

  // Student fields
  const [firstName, setFirstName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [grandfatherName, setGrandfatherName] = useState('');
  const [universityId, setUniversityId] = useState('uni-astu-001');
  const [departmentId, setDepartmentId] = useState('dept-cse-001');
  const [academicLevel, setAcademicLevel] = useState('BSc');
  const [graduationYear, setGraduationYear] = useState(2027);
  const [selectedSkills, setSelectedSkills] = useState(['React', 'Node.js', 'PostgreSQL']);

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('FinTech & Digital Payments');
  const [tinNumber, setTinNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleSkill = (skillName) => {
    setSelectedSkills((prev) =>
      prev.includes(skillName) ? prev.filter((s) => s !== skillName) : [...prev, skillName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload =
        role === 'STUDENT'
          ? {
              email,
              password,
              role: 'STUDENT',
              first_name: firstName,
              father_name: fatherName,
              grandfather_name: grandfatherName,
              phone,
              university_id: universityId,
              department_id: departmentId,
              academic_level: academicLevel,
              graduation_year: Number(graduationYear),
              location,
              skills: selectedSkills,
            }
          : {
              email,
              password,
              role: 'COMPANY',
              company_name: companyName,
              industry,
              tin_number: tinNumber,
              location,
              website,
              phone,
              description,
            };

      const user = await register(payload);
      if (user.role === 'COMPANY') {
        navigate('/company/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const currentDepartments = (catalog.departments || []).filter(
    (d) => d.university_id === universityId
  );

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-12 bg-[#060910] text-[#f8fafc]">
        <div className="redsun-box p-8 sm:p-10 space-y-6 rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f77218]/20 pb-5">
            <div>
              <div className="text-xs font-mono font-bold text-[#f66f14] uppercase tracking-wider">
                Create Account
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Join Ethio<span className="text-[#f66f14]">Intern</span> Platform
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Connecting Ethiopian university students with verified industry employers.
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#111728] border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  role === 'STUDENT'
                    ? 'button-glow text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                University Student
              </button>
              <button
                type="button"
                onClick={() => setRole('COMPANY')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  role === 'COMPANY'
                    ? 'button-glow text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Employer / Company
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/40 text-xs text-rose-300 font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {role === 'STUDENT' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Eyob"
                      className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Father Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="Aragie"
                      className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Grandfather Name
                    </label>
                    <input
                      type="text"
                      value={grandfatherName}
                      onChange={(e) => setGrandfatherName(e.target.value)}
                      placeholder="Tesfaye"
                      className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Ethiopian University *
                    </label>
                    <select
                      value={universityId}
                      onChange={(e) => setUniversityId(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs text-slate-200 bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                    >
                      {(catalog.universities || []).map((u) => (
                        <option key={u.id} value={u.id} className="bg-[#0c101d] text-white">
                          {u.name} ({u.short_name}) — {u.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      University Department *
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs text-slate-200 bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                    >
                      {currentDepartments.length > 0 ? (
                        currentDepartments.map((d) => (
                          <option key={d.id} value={d.id} className="bg-[#0c101d] text-white">
                            {d.name} ({d.code})
                          </option>
                        ))
                      ) : (
                        <option value="dept-cs" className="bg-[#0c101d] text-white">Computer Science & Engineering</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Academic Level *
                    </label>
                    <select
                      value={academicLevel}
                      onChange={(e) => setAcademicLevel(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs text-slate-200 bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                    >
                      <option value="Diploma">Diploma</option>
                      <option value="BSc">BSc</option>
                      <option value="BA">BA</option>
                      <option value="MSc">MSc</option>
                      <option value="MA">MA</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Graduation Year *
                    </label>
                    <input
                      type="number"
                      min={2024}
                      max={2032}
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl font-mono focus:border-[#f66f14]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Primary Location
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs text-slate-200 bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                    >
                      {(catalog.locations || []).map((loc) => (
                        <option key={loc} value={loc} className="bg-[#0c101d] text-white">
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Skills Multi-Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Select Your Specialized Skills (Click to toggle)
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[#060910] border border-slate-800 max-h-36 overflow-y-auto">
                    {(catalog.skills || []).map((s) => {
                      const selected = selectedSkills.includes(s.name);
                      return (
                        <button
                          key={s.id || s.name}
                          type="button"
                          onClick={() => toggleSkill(s.name)}
                          className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                            selected
                              ? 'bg-[#f66f14] text-slate-950 font-bold border-[#f66f14] shadow-[0_0_8px_rgba(246,111,20,0.4)]'
                              : 'bg-[#111728] text-slate-300 border-slate-700 hover:border-[#f66f14]/50'
                          }`}
                        >
                          {selected ? '✓ ' : ''}{s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Company Registration Fields */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Company / Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. CyberDefense Systems PLC"
                      className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Industry Sector *
                    </label>
                    <input
                      type="text"
                      required
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="Cybersecurity, Web Development, UI/UX, Data..."
                      className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Ethiopian TIN Number
                    </label>
                    <input
                      type="text"
                      value={tinNumber}
                      onChange={(e) => setTinNumber(e.target.value)}
                      placeholder="ET-TIN-00..."
                      className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl font-mono focus:border-[#f66f14]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Headquarters City
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs text-slate-200 bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                    >
                      {(catalog.locations || []).map((loc) => (
                        <option key={loc} value={loc} className="bg-[#0c101d] text-white">
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://company.et"
                      className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Company Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your organization and engineering mentorship environment..."
                    className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#f77218]/15">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu.et"
                  className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Password (min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl focus:border-[#f66f14]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs text-white bg-[#060910] border border-slate-700 rounded-xl font-mono focus:border-[#f66f14]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="button-glow w-full py-3 px-4 text-xs font-bold disabled:opacity-50"
            >
              {submitting
                ? 'Creating Account...'
                : role === 'STUDENT'
                ? 'Create Student Profile & Continue →'
                : 'Register Company (Status: PENDING Verification) →'}
            </button>
          </form>

          <div className="text-xs text-slate-400 border-t border-[#f77218]/15 pt-4">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-[#ffad75] hover:text-[#f66f14] transition-colors">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
