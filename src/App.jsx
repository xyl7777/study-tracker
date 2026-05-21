import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'study-tracker-records'

function loadStudyRecords() {
  try {
    const savedRecords = localStorage.getItem(STORAGE_KEY)

    if (!savedRecords) {
      return []
    }

    const parsedRecords = JSON.parse(savedRecords)

    if (!Array.isArray(parsedRecords)) {
      return []
    }

    return parsedRecords
  } catch {
    return []
  }
}

function App() {
  const [courseName, setCourseName] = useState('')
  const [minutes, setMinutes] = useState('')
  const [records, setRecords] = useState(loadStudyRecords)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    } catch {
      // If browser storage is unavailable, the app can still work in memory.
    }
  }, [records])

  const totalMinutes = records.reduce((total, record) => {
    return total + record.minutes
  }, 0)

  function handleAddRecord() {
    const trimmedCourseName = courseName.trim()
    const studyMinutes = Number(minutes)

    if (!trimmedCourseName || !Number.isFinite(studyMinutes) || studyMinutes <= 0) {
      return
    }

    const newRecord = {
      id: Date.now(),
      courseName: trimmedCourseName,
      minutes: studyMinutes,
    }

    setRecords([newRecord, ...records])
    setCourseName('')
    setMinutes('')
  }

  function handleDeleteRecord(id) {
    const nextRecords = records.filter((record) => record.id !== id)
    setRecords(nextRecords)
  }

  return (
    <main className="app">
      <section className="tracker">
        <h1>Study Tracker</h1>

        <div className="summary">
          <span>Total Study Time</span>
          <strong>{totalMinutes} minutes</strong>
        </div>

        <div className="form">
          <label>
            Course Name
            <input
              type="text"
              value={courseName}
              placeholder={'\u4f8b\u5982\uff1aPython'}
              onChange={(event) => setCourseName(event.target.value)}
            />
          </label>

          <label>
            Study Minutes
            <input
              type="number"
              min="1"
              value={minutes}
              placeholder={'\u4f8b\u5982\uff1a30'}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </label>

          <button type="button" onClick={handleAddRecord}>
            {'\u6dfb\u52a0\u8bb0\u5f55'}
          </button>
        </div>

        <div className="records">
          <h2>Records</h2>

          {records.length === 0 ? (
            <p className="empty">No study records yet.</p>
          ) : (
            <ul>
              {records.map((record) => (
                <li key={record.id}>
                  <div>
                    <strong>{record.courseName}</strong>
                    <span>{record.minutes} minutes</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteRecord(record.id)}
                  >
                    {'\u5220\u9664'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
