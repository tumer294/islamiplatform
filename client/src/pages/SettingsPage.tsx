import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Globe, HelpCircle, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      likes: true,
      comments: true,
      follows: true,
      events: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true,
      allowMessages: true
    },
    preferences: {
      language: 'tr',
      timezone: 'Europe/Istanbul',
      autoPlay: false
    }
  });

  const sections = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'privacy', label: 'Gizlilik', icon: Shield },
    { id: 'appearance', label: 'Görünüm', icon: Palette },
    { id: 'preferences', label: 'Tercihler', icon: Globe },
    { id: 'help', label: 'Yardım', icon: HelpCircle },
  ];

  const themes = [
    { name: 'light', label: 'Aydınlık', description: 'Klasik beyaz tema' },
    { name: 'dark', label: 'Karanlık', description: 'Göz dostu karanlık tema' },
    { name: 'islamic', label: 'İslami', description: 'Yeşil tonlarında İslami tema' },
    { name: 'ramadan', label: 'Ramazan', description: 'Altın tonlarında özel Ramazan teması' },
  ];

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleSignOut = async () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      await signOut();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ayarlar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Hesap ayarlarınızı ve tercihlerinizi yönetin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className={`
            rounded-xl border p-6
            ${theme === 'islamic' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
              theme === 'ramadan' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
              'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }
          `}>
            <nav className="space-y-2">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${activeSection === id
                      ? (theme === 'islamic' ? 'bg-emerald-600 text-white' :
                         theme === 'ramadan' ? 'bg-amber-600 text-white' :
                         'bg-primary-500 text-white')
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className={`
              rounded-xl border p-8
              ${theme === 'islamic' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
                theme === 'ramadan' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }
            `}>
              {/* Profile Settings */}
              {activeSection === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Profil Ayarları
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        E-posta Adresi
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        E-posta adresi değiştirilemez
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Kullanıcı Adı
                      </label>
                      <input
                        type="text"
                        value={user?.user_metadata?.username || ''}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        value={user?.user_metadata?.full_name || ''}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <button className={`
                      px-6 py-3 rounded-lg font-medium transition-all duration-200
                      hover:shadow-md hover:scale-105
                      ${theme === 'islamic' ? 'bg-emerald-600 hover:bg-emerald-700' :
                        theme === 'ramadan' ? 'bg-amber-600 hover:bg-amber-700' :
                        'bg-primary-500 hover:bg-primary-600'
                      }
                      text-white
                    `}>
                      Değişiklikleri Kaydet
                    </button>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeSection === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Bildirim Ayarları
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Bildirim Türleri
                      </h3>
                      <div className="space-y-4">
                        {[
                          { key: 'email', label: 'E-posta Bildirimleri', description: 'Önemli güncellemeler için e-posta al' },
                          { key: 'push', label: 'Push Bildirimleri', description: 'Tarayıcı bildirimleri' },
                          { key: 'likes', label: 'Beğeni Bildirimleri', description: 'Gönderileriniz beğenildiğinde bildirim al' },
                          { key: 'comments', label: 'Yorum Bildirimleri', description: 'Gönderilerinize yorum yapıldığında bildirim al' },
                          { key: 'follows', label: 'Takip Bildirimleri', description: 'Yeni takipçileriniz için bildirim al' },
                          { key: 'events', label: 'Etkinlik Bildirimleri', description: 'Etkinlik duyuruları için bildirim al' }
                        ].map(({ key, label, description }) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.notifications[key as keyof typeof settings.notifications]}
                                onChange={(e) => handleNotificationChange(key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeSection === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Gizlilik Ayarları
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Profil Görünürlüğü
                      </label>
                      <select
                        value={settings.privacy.profileVisibility}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="public">Herkese Açık</option>
                        <option value="followers">Sadece Takipçiler</option>
                        <option value="private">Özel</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'showEmail', label: 'E-posta Adresini Göster', description: 'Profilinde e-posta adresini göster' },
                        { key: 'showLocation', label: 'Konumu Göster', description: 'Profilinde konum bilgisini göster' },
                        { key: 'allowMessages', label: 'Mesajlara İzin Ver', description: 'Diğer kullanıcıların mesaj göndermesine izin ver' }
                      ].map(({ key, label, description }) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.privacy[key as keyof typeof settings.privacy] as boolean}
                              onChange={(e) => handlePrivacyChange(key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeSection === 'appearance' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Görünüm Ayarları
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Tema Seçimi
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {themes.map(({ name, label, description }) => (
                          <button
                            key={name}
                            onClick={() => setTheme(name as any)}
                            className={`
                              p-4 rounded-lg border-2 transition-all duration-200 text-left
                              ${theme === name
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }
                            `}
                          >
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {label}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences */}
              {activeSection === 'preferences' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Tercihler
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dil
                      </label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Saat Dilimi
                      </label>
                      <select
                        value={settings.preferences.timezone}
                        onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                        <option value="Europe/London">Londra (UTC+0)</option>
                        <option value="America/New_York">New York (UTC-5)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Otomatik Video Oynatma</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Videoları otomatik olarak oynat</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.preferences.autoPlay}
                          onChange={(e) => handlePreferenceChange('autoPlay', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Help */}
              {activeSection === 'help' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Yardım ve Destek
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <a href="#" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Sıkça Sorulan Sorular
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          En çok sorulan soruların cevaplarını bulun
                        </p>
                      </a>

                      <a href="#" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          İletişim
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Destek ekibimizle iletişime geçin
                        </p>
                      </a>

                      <a href="#" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Gizlilik Politikası
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Verilerinizin nasıl korunduğunu öğrenin
                        </p>
                      </a>

                      <a href="#" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Kullanım Şartları
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Platform kullanım kurallarını inceleyin
                        </p>
                      </a>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105"
                      >
                        <LogOut size={20} />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;