import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'study-tracker-records'
const GOALS_STORAGE_KEY = 'study-tracker-goals'

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getTodayDate() {
  return formatDate(new Date())
}

function getLastSevenDays() {
  const today = new Date()
  const days = []

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - index)
    days.push(formatDate(date))
  }

  return days
}

function makeCSVValue(value) {
  return `"${String(value).replaceAll('"', '""')}"`
}

function loadStudyRecords() {
  return loadSavedArray(STORAGE_KEY)
}

function loadStudyGoals() {
  return loadSavedArray(GOALS_STORAGE_KEY)
}

function loadSavedArray(storageKey) {
  try {
    const savedItems = localStorage.getItem(storageKey)

    if (!savedItems) {
      return []
    }

    const parsedItems = JSON.parse(savedItems)

    if (!Array.isArray(parsedItems)) {
      return []
    }

    return parsedItems
  } catch {
    return []
  }
}

function App() {
  const [courseName, setCourseName] = useState('')
  const [minutes, setMinutes] = useState('')
  const [date, setDate] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [goalCourseName, setGoalCourseName] = useState('')
  const [goalMinutes, setGoalMinutes] = useState('')
  const [editingRecordId, setEditingRecordId] = useState(null)
  const [editRecordCourseName, setEditRecordCourseName] = useState('')
  const [editRecordMinutes, setEditRecordMinutes] = useState('')
  const [editRecordDate, setEditRecordDate] = useState('')
  const [editingGoalId, setEditingGoalId] = useState(null)
  const [editGoalCourseName, setEditGoalCourseName] = useState('')
  const [editGoalMinutes, setEditGoalMinutes] = useState('')
  const [records, setRecords] = useState(loadStudyRecords)
  const [goals, setGoals] = useState(loadStudyGoals)

  useEffect(() => {
    try {
      if (records.length === 0) {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
      }
    } catch {
      // If browser storage is unavailable, the app can still work in memory.
    }
  }, [records])

  useEffect(() => {
    try {
      if (goals.length === 0) {
        localStorage.removeItem(GOALS_STORAGE_KEY)
      } else {
        localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals))
      }
    } catch {
      // If browser storage is unavailable, the app can still work in memory.
    }
  }, [goals])

  const today = getTodayDate()

  const totalMinutes = records.reduce((total, record) => {
    return total + record.minutes
  }, 0)

  const todayMinutes = records.reduce((total, record) => {
    if (record.date === today) {
      return total + record.minutes
    }

    return total
  }, 0)

  const lastSevenDaysSummary = getLastSevenDays().map((date) => {
    const minutes = records.reduce((total, record) => {
      if (record.date === date) {
        return total + record.minutes
      }

      return total
    }, 0)

    return {
      date,
      minutes,
    }
  })

  const courseSummary = records.reduce((summary, record) => {
    const existingCourse = summary.find((course) => {
      return course.courseName === record.courseName
    })

    if (existingCourse) {
      existingCourse.minutes += record.minutes
    } else {
      summary.push({
        courseName: record.courseName,
        minutes: record.minutes,
      })
    }

    return summary
  }, [])

  const filteredRecords = filterDate
    ? records.filter((record) => record.date === filterDate)
    : records

  function getCourseMinutes(courseName) {
    return records.reduce((total, record) => {
      if (record.courseName === courseName) {
        return total + record.minutes
      }

      return total
    }, 0)
  }

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
      date: date || getTodayDate(),
    }

    setRecords([newRecord, ...records])
    setCourseName('')
    setMinutes('')
    setDate('')
  }

  function handleDeleteRecord(id) {
    const nextRecords = records.filter((record) => record.id !== id)
    setRecords(nextRecords)
  }

  function handleStartEditRecord(record) {
    setEditingRecordId(record.id)
    setEditRecordCourseName(record.courseName)
    setEditRecordMinutes(String(record.minutes))
    setEditRecordDate(record.date || '')
  }

  function handleCancelEditRecord() {
    setEditingRecordId(null)
    setEditRecordCourseName('')
    setEditRecordMinutes('')
    setEditRecordDate('')
  }

  function handleSaveEditRecord(id) {
    const trimmedCourseName = editRecordCourseName.trim()
    const studyMinutes = Number(editRecordMinutes)

    if (!trimmedCourseName || !Number.isFinite(studyMinutes) || studyMinutes <= 0) {
      return
    }

    const nextRecords = records.map((record) => {
      if (record.id === id) {
        return {
          ...record,
          courseName: trimmedCourseName,
          minutes: studyMinutes,
          date: editRecordDate || getTodayDate(),
        }
      }

      return record
    })

    setRecords(nextRecords)
    handleCancelEditRecord()
  }

  function handleAddGoal() {
    const trimmedCourseName = goalCourseName.trim()
    const targetMinutes = Number(goalMinutes)

    if (!trimmedCourseName || !Number.isFinite(targetMinutes) || targetMinutes <= 0) {
      return
    }

    const newGoal = {
      id: Date.now(),
      courseName: trimmedCourseName,
      targetMinutes,
    }

    const existingGoal = goals.find((goal) => {
      return goal.courseName === trimmedCourseName
    })

    if (existingGoal) {
      const nextGoals = goals.map((goal) => {
        if (goal.courseName === trimmedCourseName) {
          return {
            ...goal,
            targetMinutes,
          }
        }

        return goal
      })

      setGoals(nextGoals)
    } else {
      setGoals([newGoal, ...goals])
    }

    setGoalCourseName('')
    setGoalMinutes('')
  }

  function handleDeleteGoal(id) {
    const nextGoals = goals.filter((goal) => goal.id !== id)
    setGoals(nextGoals)
  }

  function handleExportRecordsCSV() {
    if (records.length === 0) {
      alert('No records to export.')
      return
    }

    const header = ['Course', 'Minutes', 'Date']
    const rows = records.map((record) => {
      return [
        makeCSVValue(record.courseName),
        makeCSVValue(record.minutes),
        makeCSVValue(record.date || 'No date'),
      ].join(',')
    })

    const csvText = [header.join(','), ...rows].join('\n')
    const csvFile = new Blob([csvText], { type: 'text/csv' })
    const downloadUrl = URL.createObjectURL(csvFile)
    const link = document.createElement('a')

    link.href = downloadUrl
    link.download = 'study-records.csv'
    link.click()

    URL.revokeObjectURL(downloadUrl)
  }

  function handleClearAllData() {
    const shouldClear = confirm(
      'This will delete all records and goals. Are you sure?',
    )

    if (!shouldClear) {
      return
    }

    setRecords([])
    setGoals([])
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(GOALS_STORAGE_KEY)
    handleCancelEditRecord()
    handleCancelEditGoal()
  }

  function handleStartEditGoal(goal) {
    setEditingGoalId(goal.id)
    setEditGoalCourseName(goal.courseName)
    setEditGoalMinutes(String(goal.targetMinutes))
  }

  function handleCancelEditGoal() {
    setEditingGoalId(null)
    setEditGoalCourseName('')
    setEditGoalMinutes('')
  }

  function handleSaveEditGoal(id) {
    const trimmedCourseName = editGoalCourseName.trim()
    const targetMinutes = Number(editGoalMinutes)

    if (!trimmedCourseName || !Number.isFinite(targetMinutes) || targetMinutes <= 0) {
      return
    }

    const duplicateGoal = goals.find((goal) => {
      return goal.id !== id && goal.courseName === trimmedCourseName
    })

    if (duplicateGoal) {
      const nextGoals = goals
        .filter((goal) => goal.id !== id)
        .map((goal) => {
          if (goal.id === duplicateGoal.id) {
            return {
              ...goal,
              targetMinutes,
            }
          }

          return goal
        })

      setGoals(nextGoals)
    } else {
      const nextGoals = goals.map((goal) => {
        if (goal.id === id) {
          return {
            ...goal,
            courseName: trimmedCourseName,
            targetMinutes,
          }
        }

        return goal
      })

      setGoals(nextGoals)
    }

    handleCancelEditGoal()
  }

  return (
    <main className="app">
      <section className="tracker">
        <header className="app-header">
          <div>
            <h1>Study Tracker</h1>
            <p>Track your study time, review progress, and course goals.</p>
          </div>

          <div className="app-actions">
            <button type="button" onClick={handleExportRecordsCSV}>
              Export Records CSV
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={handleClearAllData}
            >
              Clear All Data
            </button>
          </div>
        </header>

        <div className="summary">
          <div>
            <span>All Time Study Time</span>
            <strong>{totalMinutes} minutes</strong>
          </div>

          <div>
            <span>Today Study Time</span>
            <strong>{todayMinutes} minutes</strong>
          </div>

          <div>
            <span>Total Records</span>
            <strong>{records.length}</strong>
          </div>

          <div>
            <span>Total Goals</span>
            <strong>{goals.length}</strong>
          </div>
        </div>

        <div className="last-seven-days">
          <h2>Last 7 Days Summary</h2>

          <ul>
            {lastSevenDaysSummary.map((day) => (
              <li key={day.date}>
                <strong>{day.date}</strong>
                <span>{day.minutes} minutes</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="course-summary">
          <h2>Course Summary</h2>

          {courseSummary.length === 0 ? (
            <p className="empty">No course summary yet.</p>
          ) : (
            <ul>
              {courseSummary.map((course) => (
                <li key={course.courseName}>
                  <strong>{course.courseName}</strong>
                  <span>{course.minutes} minutes</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="course-goals">
          <h2>Course Goals</h2>

          <div className="goal-form">
            <label>
              Course Name
              <input
                type="text"
                value={goalCourseName}
                placeholder={'\u4f8b\u5982\uff1aPDE'}
                onChange={(event) => setGoalCourseName(event.target.value)}
              />
            </label>

            <label>
              Target Minutes
              <input
                type="number"
                min="1"
                value={goalMinutes}
                placeholder={'\u4f8b\u5982\uff1a600'}
                onChange={(event) => setGoalMinutes(event.target.value)}
              />
            </label>

            <button type="button" onClick={handleAddGoal}>
              Add Goal
            </button>
          </div>

          {goals.length === 0 ? (
            <p className="empty">No course goals yet.</p>
          ) : (
            <ul>
              {goals.map((goal) => {
                const completedMinutes = getCourseMinutes(goal.courseName)
                const targetMinutes = Number(goal.targetMinutes)
                const progress =
                  targetMinutes > 0
                    ? Math.round((completedMinutes / targetMinutes) * 100)
                    : 0
                const progressBarWidth = Math.min(progress, 100)

                return (
                  <li
                    key={goal.id}
                    className={editingGoalId === goal.id ? 'editing' : ''}
                  >
                    {editingGoalId === goal.id ? (
                      <div className="edit-form">
                        <label>
                          Course Name
                          <input
                            type="text"
                            value={editGoalCourseName}
                            onChange={(event) =>
                              setEditGoalCourseName(event.target.value)
                            }
                          />
                        </label>

                        <label>
                          Target Minutes
                          <input
                            type="number"
                            min="1"
                            value={editGoalMinutes}
                            onChange={(event) =>
                              setEditGoalMinutes(event.target.value)
                            }
                          />
                        </label>

                        <div className="button-row">
                          <button
                            type="button"
                            onClick={() => handleSaveEditGoal(goal.id)}
                          >
                            Save
                          </button>
                          <button type="button" onClick={handleCancelEditGoal}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="goal-info">
                          <strong>{goal.courseName}</strong>
                          <span>
                            {completedMinutes} / {targetMinutes} minutes
                          </span>
                          <span>Progress: {progress}%</span>
                          <div className="progress-bar">
                            <div style={{ width: `${progressBarWidth}%` }}></div>
                          </div>
                        </div>

                        <div className="button-row">
                          <button
                            type="button"
                            onClick={() => handleStartEditGoal(goal)}
                          >
                            Edit Goal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            Delete Goal
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
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

          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>

          <button type="button" onClick={handleAddRecord}>
            {'\u6dfb\u52a0\u8bb0\u5f55'}
          </button>
        </div>

        <div className="records">
          <h2>Records</h2>

          <div className="record-filter">
            <label>
              Filter by Date
              <input
                type="date"
                value={filterDate}
                onChange={(event) => setFilterDate(event.target.value)}
              />
            </label>

            <button type="button" onClick={() => setFilterDate('')}>
              Clear Filter
            </button>
          </div>

          {filteredRecords.length === 0 ? (
            <p className="empty">
              {filterDate ? 'No records for this date.' : 'No study records yet.'}
            </p>
          ) : (
            <ul>
              {filteredRecords.map((record) => (
                <li
                  key={record.id}
                  className={editingRecordId === record.id ? 'editing' : ''}
                >
                  {editingRecordId === record.id ? (
                    <div className="edit-form">
                      <label>
                        Course Name
                        <input
                          type="text"
                          value={editRecordCourseName}
                          onChange={(event) =>
                            setEditRecordCourseName(event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Study Minutes
                        <input
                          type="number"
                          min="1"
                          value={editRecordMinutes}
                          onChange={(event) =>
                            setEditRecordMinutes(event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Date
                        <input
                          type="date"
                          value={editRecordDate}
                          onChange={(event) =>
                            setEditRecordDate(event.target.value)
                          }
                        />
                      </label>

                      <div className="button-row">
                        <button
                          type="button"
                          onClick={() => handleSaveEditRecord(record.id)}
                        >
                          Save
                        </button>
                        <button type="button" onClick={handleCancelEditRecord}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <strong>{record.courseName}</strong>
                        <span>{record.date || 'No date'}</span>
                        <span>{record.minutes} minutes</span>
                      </div>

                      <div className="button-row">
                        <button
                          type="button"
                          onClick={() => handleStartEditRecord(record)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          {'\u5220\u9664'}
                        </button>
                      </div>
                    </>
                  )}
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
