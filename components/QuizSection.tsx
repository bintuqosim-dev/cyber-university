'use client'
import { useState } from 'react'
import { HelpCircle, Check, X, RotateCcw } from 'lucide-react'

type Test = { id: number; question: string; options: string; correct_index: number }

export default function QuizSection({ tests }: { tests: Test[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const score = submitted ? tests.filter(t => answers[t.id] === t.correct_index).length : 0

  const reset = () => { setAnswers({}); setSubmitted(false) }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-400" /> Test savollari
        </h2>
        {submitted && (
          <button onClick={reset} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
            <RotateCcw className="w-4 h-4" /> Qayta urinish
          </button>
        )}
      </div>

      {submitted && (
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-5 ${score === tests.length ? 'bg-green-900/30 border border-green-800' : 'bg-yellow-900/30 border border-yellow-800'}`}>
          <div className={`text-2xl font-bold ${score === tests.length ? 'text-green-400' : 'text-yellow-400'}`}>
            {score}/{tests.length}
          </div>
          <div>
            <p className="font-semibold text-white">
              {score === tests.length ? 'Ajoyib! Hammasi to\'g\'ri!' : `${tests.length - score} ta xato`}
            </p>
            <p className="text-sm text-gray-400">
              {score === tests.length ? 'Mavzuni mukammal o\'zlashtirdingiz 🎉' : 'Mavzuni qayta ko\'rib chiqing'}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {tests.map((test, qi) => {
          const opts = JSON.parse(test.options) as string[]
          const selected = answers[test.id]
          const isCorrect = submitted && selected === test.correct_index
          const isWrong = submitted && selected !== undefined && selected !== test.correct_index

          return (
            <div key={test.id}>
              <p className="font-medium text-white mb-3">
                <span className="text-gray-500 mr-2">{qi + 1}.</span>
                {test.question}
              </p>
              <div className="space-y-2">
                {opts.map((opt, oi) => {
                  const isSelected = selected === oi
                  const isCorrectOpt = submitted && oi === test.correct_index
                  const isWrongOpt = submitted && isSelected && oi !== test.correct_index

                  return (
                    <button key={oi}
                      onClick={() => !submitted && setAnswers({ ...answers, [test.id]: oi })}
                      disabled={submitted}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
                        isCorrectOpt
                          ? 'bg-green-900/30 border-green-700 text-green-300'
                          : isWrongOpt
                          ? 'bg-red-900/30 border-red-700 text-red-300'
                          : isSelected
                          ? 'bg-blue-900/40 border-blue-700 text-blue-300'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-750'
                      }`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isCorrectOpt ? 'border-green-500 bg-green-500'
                          : isWrongOpt ? 'border-red-500 bg-red-500'
                          : isSelected ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-600'
                      }`}>
                        {isCorrectOpt && <Check className="w-3 h-3 text-white" />}
                        {isWrongOpt && <X className="w-3 h-3 text-white" />}
                        {!submitted && isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {!submitted && (
        <button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < tests.length}
          className="mt-6 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-500 text-white py-3 rounded-xl font-semibold transition-colors">
          Tekshirish ({Object.keys(answers).length}/{tests.length} javob)
        </button>
      )}
    </div>
  )
}
