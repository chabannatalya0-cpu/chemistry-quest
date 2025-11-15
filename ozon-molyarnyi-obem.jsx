import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, BookOpen, FlaskConical, Copy, Send, Download } from 'lucide-react';

export default function ChemistryWorksheet() {
  // Стан для відповідей учня
  const [answers, setAnswers] = useState({
    // Озон - теоретична частина
    ozon1: '',
    ozon2: '',
    ozon3: [],
    ozon4: '',
    ozon5: [],
    // Молярний об'єм - розрахункові задачі
    task1: '',
    task2: '',
    task3: '',
    task4: '',
    task5: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [teacherMode, setTeacherMode] = useState(false);
  const [teacherPassword, setTeacherPassword] = useState('');
  const [allResults, setAllResults] = useState([]);

  // Правильні відповіді
  const correctAnswers = {
    ozon1: 'O₃',
    ozon2: '3O₂ → 2O₃',
    ozon3: ['захист', 'уф'],
    ozon4: 'стратосфера',
    ozon5: ['знезараження', 'очищення'],
    task1: '44.8',
    task2: '67.2',
    task3: '2.24',
    task4: '134.4',
    task5: '0.67'
  };

  // Перевірка відповідей
  const checkAnswer = (key, value) => {
    if (!submitted) return null;
    
    if (Array.isArray(correctAnswers[key])) {
      const valueStr = value.toString().toLowerCase();
      return correctAnswers[key].some(answer => 
        valueStr.includes(answer.toLowerCase())
      );
    }
    
    if (key.startsWith('task')) {
      const numValue = parseFloat(value);
      const correctValue = parseFloat(correctAnswers[key]);
      return Math.abs(numValue - correctValue) < 0.1;
    }
    
    return value.toLowerCase().trim() === correctAnswers[key].toLowerCase();
  };

  const handleInputChange = (key, value) => {
    setAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = () => {
    if (!studentName || !studentClass) {
      alert('Будь ласка, введіть ваше ім\'я та клас!');
      return;
    }
    setSubmitted(true);
    
    // Зберігаємо результати в localStorage
    const result = {
      id: Date.now(),
      studentName,
      studentClass,
      timestamp: new Date().toLocaleString('uk-UA'),
      answers,
      score: calculateScore()
    };
    
    const existingResults = JSON.parse(localStorage.getItem('chemistryResults') || '[]');
    existingResults.push(result);
    localStorage.setItem('chemistryResults', JSON.stringify(existingResults));
  };

  const handleReset = () => {
    setAnswers({
      ozon1: '', ozon2: '', ozon3: [], ozon4: '', ozon5: [],
      task1: '', task2: '', task3: '', task4: '', task5: ''
    });
    setSubmitted(false);
  };

  // Вхід до панелі вчителя
  const handleTeacherLogin = () => {
    const correctPassword = 'chemistry2024'; // Змініть на свій пароль
    if (teacherPassword === correctPassword) {
      setTeacherMode(true);
      loadAllResults();
    } else {
      alert('❌ Невірний код доступу!');
    }
  };

  // Завантаження всіх результатів
  const loadAllResults = () => {
    const results = JSON.parse(localStorage.getItem('chemistryResults') || '[]');
    setAllResults(results.sort((a, b) => b.id - a.id)); // Сортуємо від нових до старих
  };

  // Очищення всіх результатів
  const clearAllResults = () => {
    if (window.confirm('Ви впевнені, що хочете видалити ВСІ результати? Цю дію неможливо скасувати.')) {
      localStorage.removeItem('chemistryResults');
      setAllResults([]);
      alert('✅ Всі результати видалено');
    }
  };

  // Експорт всіх результатів
  const exportAllResults = () => {
    let report = '═══════════════════════════════════════\n';
    report += '📊 ЗВЕДЕНА ТАБЛИЦЯ РЕЗУЛЬТАТІВ\n';
    report += 'Тема: Озон та Молярний об\'єм газів\n';
    report += `Дата експорту: ${new Date().toLocaleString('uk-UA')}\n`;
    report += `Всього робіт: ${allResults.length}\n`;
    report += '═══════════════════════════════════════\n\n';

    allResults.forEach((result, index) => {
      const ozonScore = ['ozon1', 'ozon2', 'ozon3', 'ozon4', 'ozon5'].filter(key => 
        checkAnswerForResult(result.answers, key)
      ).length;
      const tasksScore = ['task1', 'task2', 'task3', 'task4', 'task5'].filter(key => 
        checkAnswerForResult(result.answers, key)
      ).length;
      
      report += `${index + 1}. ${result.studentName} (${result.studentClass})\n`;
      report += `   Дата: ${result.timestamp}\n`;
      report += `   Результат: ${result.score.correct}/${result.score.total} (${result.score.percentage}%)\n`;
      report += `   Теорія: ${ozonScore}/5 | Задачі: ${tasksScore}/5\n`;
      report += '───────────────────────────────────────\n';
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Зведена_таблиця_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Перевірка відповіді для збереженого результату
  const checkAnswerForResult = (resultAnswers, key) => {
    const value = resultAnswers[key];
    if (Array.isArray(correctAnswers[key])) {
      const valueStr = value.toString().toLowerCase();
      return correctAnswers[key].some(answer => 
        valueStr.includes(answer.toLowerCase())
      );
    }
    if (key.startsWith('task')) {
      const numValue = parseFloat(value);
      const correctValue = parseFloat(correctAnswers[key]);
      return Math.abs(numValue - correctValue) < 0.1;
    }
    return value.toLowerCase().trim() === correctAnswers[key].toLowerCase();
  };

  const calculateScore = () => {
    let correct = 0;
    let total = Object.keys(correctAnswers).length;
    
    Object.keys(correctAnswers).forEach(key => {
      if (checkAnswer(key, answers[key])) {
        correct++;
      }
    });
    
    return { correct, total, percentage: Math.round((correct / total) * 100) };
  };

  const score = submitted ? calculateScore() : { correct: 0, total: 0, percentage: 0 };

  // Генерація звіту для вчителя
  const generateReport = () => {
    const timestamp = new Date().toLocaleString('uk-UA');
    const ozonScore = ['ozon1', 'ozon2', 'ozon3', 'ozon4', 'ozon5'].filter(key => 
      checkAnswer(key, answers[key])
    ).length;
    const tasksScore = ['task1', 'task2', 'task3', 'task4', 'task5'].filter(key => 
      checkAnswer(key, answers[key])
    ).length;
    
    const grade = score.percentage >= 90 ? '12 (Високий)' :
                  score.percentage >= 80 ? '10-11 (Достатній)' :
                  score.percentage >= 60 ? '7-9 (Середній)' :
                  '1-6 (Початковий)';

    return `
═══════════════════════════════════════
📊 РЕЗУЛЬТАТИ РОБОТИ З ХІМІЇ
═══════════════════════════════════════

👤 Учень: ${studentName}
📚 Клас: ${studentClass}
📅 Дата: ${timestamp}
📝 Тема: Озон та Молярний об'єм газів

───────────────────────────────────────
ЗАГАЛЬНИЙ РЕЗУЛЬТАТ
───────────────────────────────────────
✓ Правильних відповідей: ${score.correct} / ${score.total}
📈 Відсоток виконання: ${score.percentage}%
🎯 Оцінка: ${grade}

───────────────────────────────────────
ДЕТАЛІЗАЦІЯ
───────────────────────────────────────
📘 Озон (теорія): ${ozonScore} / 5
📗 Молярний об'єм (задачі): ${tasksScore} / 5

───────────────────────────────────────
ВІДПОВІДІ УЧНЯ
───────────────────────────────────────

ОЗОН:
1. Формула озону: ${answers.ozon1} ${checkAnswer('ozon1', answers.ozon1) ? '✓' : '✗'}
2. Рівняння утворення: ${answers.ozon2} ${checkAnswer('ozon2', answers.ozon2) ? '✓' : '✗'}
3. Роль озонового шару: ${answers.ozon3} ${checkAnswer('ozon3', answers.ozon3) ? '✓' : '✗'}
4. Шар атмосфери: ${answers.ozon4} ${checkAnswer('ozon4', answers.ozon4) ? '✓' : '✗'}
5. Застосування: ${answers.ozon5} ${checkAnswer('ozon5', answers.ozon5) ? '✓' : '✗'}

МОЛЯРНИЙ ОБ'ЄМ ГАЗІВ:
Задача 1: ${answers.task1} л ${checkAnswer('task1', answers.task1) ? '✓' : '✗'} (правильно: 44.8 л)
Задача 2: ${answers.task2} л ${checkAnswer('task2', answers.task2) ? '✓' : '✗'} (правильно: 67.2 л)
Задача 3: ${answers.task3} л ${checkAnswer('task3', answers.task3) ? '✓' : '✗'} (правильно: 2.24 л)
Задача 4: ${answers.task4} л ${checkAnswer('task4', answers.task4) ? '✓' : '✗'} (правильно: 134.4 л)
Задача 5: ${answers.task5} л ${checkAnswer('task5', answers.task5) ? '✓' : '✗'} (правильно: 0.67 л)

═══════════════════════════════════════
КЗ "Василівський ліцей «Сузір'я»"
Вчитель хімії: Наталія Володимирівна
═══════════════════════════════════════
    `.trim();
  };

  // Копіювання результатів в буфер обміну
  const copyResults = async () => {
    try {
      await navigator.clipboard.writeText(generateReport());
      alert('✅ Результати скопійовано! Тепер можна надіслати вчителю через Viber, Telegram або Email');
    } catch (err) {
      alert('❌ Помилка копіювання. Спробуйте ще раз.');
    }
  };

  // Завантаження результатів як файл
  const downloadResults = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Результати_${studentName.replace(/\s+/g, '_')}_${studentClass}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const InputField = ({ questionKey, placeholder, type = "text" }) => {
    const isCorrect = checkAnswer(questionKey, answers[questionKey]);
    
    return (
      <div className="relative">
        <input
          type={type}
          value={answers[questionKey]}
          onChange={(e) => handleInputChange(questionKey, e.target.value)}
          placeholder={placeholder}
          disabled={submitted}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
            submitted 
              ? isCorrect 
                ? 'border-green-500 bg-green-50' 
                : 'border-red-500 bg-red-50'
              : 'border-gray-300 focus:border-blue-500'
          }`}
        />
        {submitted && (
          <div className="absolute right-3 top-2.5">
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
        )}
      </div>
    );
  };

  const TextAreaField = ({ questionKey, placeholder, rows = 3 }) => {
    const isCorrect = checkAnswer(questionKey, answers[questionKey]);
    
    return (
      <div className="relative">
        <textarea
          value={answers[questionKey]}
          onChange={(e) => handleInputChange(questionKey, e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={submitted}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
            submitted 
              ? isCorrect 
                ? 'border-green-500 bg-green-50' 
                : 'border-red-500 bg-red-50'
              : 'border-gray-300 focus:border-blue-500'
          }`}
        />
        {submitted && (
          <div className="absolute right-3 top-2.5">
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FlaskConical className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Робочий аркуш з хімії
                </h1>
                <p className="text-gray-600">8 клас • Озон та Молярний об'єм газів</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {submitted && !teacherMode && (
                <div className="text-right">
                  <div className={`text-4xl font-bold ${
                    score.percentage >= 80 ? 'text-green-600' : 
                    score.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {score.percentage}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {score.correct} з {score.total}
                  </div>
                </div>
              )}
              {!teacherMode && (
                <button
                  onClick={() => setTeacherMode('login')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                >
                  👩‍🏫 Панель вчителя
                </button>
              )}
            </div>
          </div>

          {/* Дані учня */}
          {!teacherMode && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ім'я та прізвище
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={submitted}
                  placeholder="Введіть ваше ім'я"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Клас
                </label>
                <input
                  type="text"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  disabled={submitted}
                  placeholder="8-А"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Форма входу для вчителя */}
          {teacherMode === 'login' && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-purple-900 mb-4">🔐 Вхід для вчителя</h3>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTeacherLogin()}
                  placeholder="Введіть код доступу"
                  className="flex-1 px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleTeacherLogin}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Увійти
                </button>
                <button
                  onClick={() => setTeacherMode(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Скасувати
                </button>
              </div>
              <p className="text-sm text-purple-700 mt-2">
                💡 Стандартний код: chemistry2024
              </p>
            </div>
          )}
        </div>

        {/* ПАНЕЛЬ ВЧИТЕЛЯ */}
        {teacherMode === true && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">👩‍🏫 Панель вчителя</h2>
                  <p className="text-purple-100">Перегляд результатів учнів</p>
                </div>
                <button
                  onClick={() => {
                    setTeacherMode(false);
                    setTeacherPassword('');
                  }}
                  className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                >
                  ← Вийти
                </button>
              </div>
            </div>

            {/* Статистика */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-blue-600">{allResults.length}</div>
                <div className="text-gray-600 text-sm">Всього робіт</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-green-600">
                  {allResults.filter(r => r.score.percentage >= 80).length}
                </div>
                <div className="text-gray-600 text-sm">Високий рівень</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-yellow-600">
                  {allResults.filter(r => r.score.percentage >= 60 && r.score.percentage < 80).length}
                </div>
                <div className="text-gray-600 text-sm">Середній рівень</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-purple-600">
                  {allResults.length > 0 ? Math.round(allResults.reduce((sum, r) => sum + r.score.percentage, 0) / allResults.length) : 0}%
                </div>
                <div className="text-gray-600 text-sm">Середній бал</div>
              </div>
            </div>

            {/* Кнопки управління */}
            <div className="flex gap-4">
              <button
                onClick={loadAllResults}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Оновити
              </button>
              <button
                onClick={exportAllResults}
                disabled={allResults.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                Експортувати всі
              </button>
              <button
                onClick={clearAllResults}
                disabled={allResults.length === 0}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Очистити всі
              </button>
            </div>

            {/* Таблиця результатів */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Учень</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Клас</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Дата</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Теорія</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Задачі</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Результат</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Оцінка</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allResults.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                          📭 Поки що немає результатів
                        </td>
                      </tr>
                    ) : (
                      allResults.map((result, index) => {
                        const ozonScore = ['ozon1', 'ozon2', 'ozon3', 'ozon4', 'ozon5'].filter(key => 
                          checkAnswerForResult(result.answers, key)
                        ).length;
                        const tasksScore = ['task1', 'task2', 'task3', 'task4', 'task5'].filter(key => 
                          checkAnswerForResult(result.answers, key)
                        ).length;
                        
                        return (
                          <tr key={result.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{result.studentName}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{result.studentClass}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{result.timestamp}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                ozonScore >= 4 ? 'bg-green-100 text-green-800' : 
                                ozonScore >= 3 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {ozonScore}/5
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                tasksScore >= 4 ? 'bg-green-100 text-green-800' : 
                                tasksScore >= 3 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {tasksScore}/5
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`text-lg font-bold ${
                                result.score.percentage >= 80 ? 'text-green-600' : 
                                result.score.percentage >= 60 ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>
                                {result.score.percentage}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                              {result.score.percentage >= 90 ? '12' :
                               result.score.percentage >= 80 ? '10-11' :
                               result.score.percentage >= 60 ? '7-9' :
                               '1-6'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* РЕЖИМ УЧНЯ - показуємо тільки якщо не в режимі вчителя */}
        {!teacherMode && (
          <>
        {/* Розділ 1: ОЗОН */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Частина 1: Озон (O₃)</h2>
          </div>

          <div className="space-y-6">
            {/* Питання 1 */}
            <div>
              <p className="font-semibold text-gray-800 mb-3">
                1. Напишіть хімічну формулу озону:
              </p>
              <InputField 
                questionKey="ozon1" 
                placeholder="Введіть формулу (використовуйте індекси)"
              />
              {submitted && !checkAnswer('ozon1', answers.ozon1) && (
                <p className="text-sm text-red-600 mt-2">Підказка: молекула складається з трьох атомів Оксигену</p>
              )}
            </div>

            {/* Питання 2 */}
            <div>
              <p className="font-semibold text-gray-800 mb-3">
                2. Напишіть рівняння утворення озону з кисню під дією ультрафіолету:
              </p>
              <InputField 
                questionKey="ozon2" 
                placeholder="3O₂ → ..."
              />
              {submitted && !checkAnswer('ozon2', answers.ozon2) && (
                <p className="text-sm text-red-600 mt-2">Підказка: з трьох молекул кисню утворюються дві молекули озону</p>
              )}
            </div>

            {/* Питання 3 */}
            <div>
              <p className="font-semibold text-gray-800 mb-3">
                3. Яку роль відіграє озоновий шар для життя на Землі?
              </p>
              <TextAreaField 
                questionKey="ozon3" 
                placeholder="Опишіть значення озонового шару (згадайте про УФ-випромінювання)"
                rows={3}
              />
              {submitted && !checkAnswer('ozon3', answers.ozon3) && (
                <p className="text-sm text-red-600 mt-2">Підказка: озоновий шар захищає від шкідливого ультрафіолетового випромінювання</p>
              )}
            </div>

            {/* Питання 4 */}
            <div>
              <p className="font-semibold text-gray-800 mb-3">
                4. У якому шарі атмосфери знаходиться озоновий шар?
              </p>
              <InputField 
                questionKey="ozon4" 
                placeholder="Назва шару атмосфери"
              />
              {submitted && !checkAnswer('ozon4', answers.ozon4) && (
                <p className="text-sm text-red-600 mt-2">Підказка: цей шар розташований на висоті 15-50 км над Землею</p>
              )}
            </div>

            {/* Питання 5 */}
            <div>
              <p className="font-semibold text-gray-800 mb-3">
                5. Де використовують озон у побуті та промисловості?
              </p>
              <TextAreaField 
                questionKey="ozon5" 
                placeholder="Наведіть приклади застосування озону"
                rows={3}
              />
              {submitted && !checkAnswer('ozon5', answers.ozon5) && (
                <p className="text-sm text-red-600 mt-2">Підказка: озон використовують для знезараження води та повітря</p>
              )}
            </div>
          </div>
        </div>

        {/* Розділ 2: МОЛЯРНИЙ ОБ'ЄМ ГАЗІВ */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Частина 2: Молярний об'єм газів</h2>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <p className="font-semibold text-blue-900 mb-2">📌 Довідкова інформація:</p>
            <p className="text-blue-800">
              <strong>Молярний об'єм (Vm)</strong> = 22,4 л/моль (за н.у.)<br/>
              <strong>Формула:</strong> V = n × Vm, де V – об'єм (л), n – кількість речовини (моль)
            </p>
          </div>

          <div className="space-y-6">
            {/* Задача 1 */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <p className="font-semibold text-gray-800 mb-3">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-2">Задача 1</span>
                Обчисліть об'єм, який займає 2 моль кисню (O₂) за нормальних умов.
              </p>
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-2">Дано: n(O₂) = 2 моль, Vm = 22,4 л/моль</p>
                <p className="text-sm text-gray-600 mb-3">Знайти: V(O₂) = ?</p>
              </div>
              <div className="flex items-center gap-3">
                <InputField 
                  questionKey="task1" 
                  placeholder="Введіть відповідь"
                  type="number"
                />
                <span className="text-gray-600">л</span>
              </div>
              {submitted && !checkAnswer('task1', answers.task1) && (
                <p className="text-sm text-red-600 mt-2">Підказка: V = n × Vm = 2 моль × 22,4 л/моль</p>
              )}
            </div>

            {/* Задача 2 */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <p className="font-semibold text-gray-800 mb-3">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-2">Задача 2</span>
                Який об'єм займає 3 моль азоту (N₂) за нормальних умов?
              </p>
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-2">Дано: n(N₂) = 3 моль</p>
                <p className="text-sm text-gray-600 mb-3">Знайти: V(N₂) = ?</p>
              </div>
              <div className="flex items-center gap-3">
                <InputField 
                  questionKey="task2" 
                  placeholder="Введіть відповідь"
                  type="number"
                />
                <span className="text-gray-600">л</span>
              </div>
              {submitted && !checkAnswer('task2', answers.task2) && (
                <p className="text-sm text-red-600 mt-2">Підказка: використайте формулу V = n × 22,4</p>
              )}
            </div>

            {/* Задача 3 */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <p className="font-semibold text-gray-800 mb-3">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-2">Задача 3</span>
                Обчисліть об'єм, який займає 0,1 моль вуглекислого газу (CO₂) за н.у.
              </p>
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-2">Дано: n(CO₂) = 0,1 моль</p>
                <p className="text-sm text-gray-600 mb-3">Знайти: V(CO₂) = ?</p>
              </div>
              <div className="flex items-center gap-3">
                <InputField 
                  questionKey="task3" 
                  placeholder="Введіть відповідь"
                  type="number"
                />
                <span className="text-gray-600">л</span>
              </div>
              {submitted && !checkAnswer('task3', answers.task3) && (
                <p className="text-sm text-red-600 mt-2">Підказка: 0,1 × 22,4 = ?</p>
              )}
            </div>

            {/* Задача 4 */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <p className="font-semibold text-gray-800 mb-3">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-2">Задача 4</span>
                Який об'єм займають 6 моль озону (O₃) за нормальних умов?
              </p>
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-2">Дано: n(O₃) = 6 моль</p>
                <p className="text-sm text-gray-600 mb-3">Знайти: V(O₃) = ?</p>
              </div>
              <div className="flex items-center gap-3">
                <InputField 
                  questionKey="task4" 
                  placeholder="Введіть відповідь"
                  type="number"
                />
                <span className="text-gray-600">л</span>
              </div>
              {submitted && !checkAnswer('task4', answers.task4) && (
                <p className="text-sm text-red-600 mt-2">Підказка: V = 6 × 22,4</p>
              )}
            </div>

            {/* Задача 5 */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <p className="font-semibold text-gray-800 mb-3">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-2">Задача 5</span>
                Який об'єм займає 0,03 моль водню (H₂) за н.у.? (Округліть до сотих)
              </p>
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-2">Дано: n(H₂) = 0,03 моль</p>
                <p className="text-sm text-gray-600 mb-3">Знайти: V(H₂) = ?</p>
              </div>
              <div className="flex items-center gap-3">
                <InputField 
                  questionKey="task5" 
                  placeholder="Введіть відповідь"
                  type="number"
                />
                <span className="text-gray-600">л</span>
              </div>
              {submitted && !checkAnswer('task5', answers.task5) && (
                <p className="text-sm text-red-600 mt-2">Підказка: 0,03 × 22,4 ≈ 0,67 л</p>
              )}
            </div>
          </div>
        </div>

        {/* Кнопки керування */}
        <div className="flex gap-4 justify-center">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg"
            >
              <CheckCircle className="w-5 h-5" />
              Перевірити роботу
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              Почати заново
            </button>
          )}
        </div>

        {/* Результати для вчителя */}
        {submitted && (
          <>
            <div className="mt-6 bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                📊 Результати для вчителя
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-700"><strong>Учень:</strong> {studentName}</p>
                  <p className="text-gray-700"><strong>Клас:</strong> {studentClass}</p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Результат:</strong> {score.correct} / {score.total} ({score.percentage}%)
                  </p>
                  <p className="text-gray-700">
                    <strong>Оцінка:</strong> {' '}
                    {score.percentage >= 90 ? '12 (Високий)' :
                     score.percentage >= 80 ? '10-11 (Достатній)' :
                     score.percentage >= 60 ? '7-9 (Середній)' :
                     '1-6 (Початковий)'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold text-blue-900 mb-2">Озон (теорія):</p>
                  <p className="text-blue-800">
                    {['ozon1', 'ozon2', 'ozon3', 'ozon4', 'ozon5'].filter(key => 
                      checkAnswer(key, answers[key])
                    ).length} / 5 правильних
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-semibold text-green-900 mb-2">Молярний об'єм (задачі):</p>
                  <p className="text-green-800">
                    {['task1', 'task2', 'task3', 'task4', 'task5'].filter(key => 
                      checkAnswer(key, answers[key])
                    ).length} / 5 правильних
                  </p>
                </div>
              </div>
            </div>

            {/* Блок надсилання результатів */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg p-8 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <Send className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-800">
                  Надіслати результати вчителю
                </h3>
              </div>
              
              <p className="text-gray-700 mb-4">
                Оберіть зручний спосіб, щоб поділитися результатами з Наталією Володимирівною:
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Кнопка копіювання */}
                <button
                  onClick={copyResults}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Copy className="w-5 h-5" />
                  Копіювати
                </button>

                {/* Кнопка завантаження */}
                <button
                  onClick={downloadResults}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Download className="w-5 h-5" />
                  Завантажити
                </button>

                {/* Кнопка скріншот */}
                <button
                  onClick={() => alert('💡 Порада: Зробіть скріншот цього екрану (Win + Shift + S або Print Screen) і надішліть вчителю')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  📸 Скріншот
                </button>
              </div>

              <div className="mt-4 bg-white rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-gray-700 font-semibold mb-2">📌 Інструкція:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>1. Копіювати:</strong> Натисніть кнопку "Копіювати" → вставте в Viber/Telegram</li>
                  <li><strong>2. Завантажити:</strong> Збережеться файл .txt → прикріпіть до повідомлення</li>
                  <li><strong>3. Скріншот:</strong> Зробіть знімок екрану → надішліть вчителю</li>
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Футер */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>КЗ "Василівський ліцей «Сузір'я»" • Хімія 8 клас • 2024-2025 н.р.</p>
        </div>
      </div>
    </div>
  );
}
