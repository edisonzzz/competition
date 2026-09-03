import { useState } from 'react';
import { LogIn, UserPlus, Shield, Lock, User } from 'lucide-react';
import { authAPI } from '../services/api';
import anssiLogo from '../assets/anssi-logo.png';
import useLang from '../useLang';

export default function LoginPage({ onLogin }) {
  const { _t, lang, toggleLang } = useLang();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', team_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await authAPI.register(formData);
        alert('Registration successful! Please login');
        setIsRegister(false);
        setFormData({ username: '', password: '', team_name: '' });
      } else {
        const response = await authAPI.login({ username: formData.username, password: formData.password });
        onLogin(response.data.user, response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* White card containing logo and form */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          {/* Logo area */}
          <div className="text-center pt-8 pb-2 px-8">
            <div className="inline-flex items-center justify-center mb-3">
              <img src={anssiLogo} alt="ANSSI" className="w-auto object-contain" style={{ maxHeight: '160px' }} />
            </div>
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <Shield className="w-5 h-5" />
              <p className="text-lg font-semibold">{lang === 'fr' ? 'Compétition de Cybersécurité' : 'Cybersecurity Competition'}</p>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              {lang === 'fr' ? 'Agence Nationale de la Sécurité des Systèmes d\'Information' : 'Agence Nationale de la Sécurité des Systèmes d\'Information'}
            </p>
          </div>

          {/* Language toggle */}
          <div className="px-8 pt-4 flex justify-end">
            <button onClick={toggleLang} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {lang === 'en' ? 'Français' : 'English'}
            </button>
          </div>

          {/* Tab switcher */}
          <div className="px-8 pt-2">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setIsRegister(false)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                  !isRegister ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {_t('login.signIn')}
              </button>
              <button
                onClick={() => setIsRegister(true)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                  isRegister ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {_t('login.register')}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">{_t('login.username')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder={_t('login.username')} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">{_t('login.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={_t('login.password')} required />
              </div>
            </div>

            {isRegister && (
              <div className="space-y-1 animate-fade-in">
                <label className="block text-sm font-semibold text-gray-700">{_t('login.teamName')}</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={formData.team_name} onChange={(e) => setFormData({ ...formData, team_name: e.target.value })} placeholder={_t('login.teamName')} required={isRegister} />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-shake">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> {_t('login.processing')}
                </div>
              ) : isRegister ? (<><UserPlus className="w-5 h-5" /> {_t('login.createAccount')}</>) : (<><LogIn className="w-5 h-5" /> {_t('login.signIn')}</>)}
            </button>
          </form>
        </div>

        <p className="text-center text-blue-200 text-sm mt-4">{_t('login.loginSubtitle')}</p>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}