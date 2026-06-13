'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { GW } from '../lib/guidedWalkTheme.js';
import { GwButton } from '../components/write/gwShared.jsx';

// ── Writing Courses — course list ("write_courses") ──────────────────────────
// Three sequential courses: The Craft of Three (SAQ), The Art of Argument (LEQ),
// Reading the Room (DBQ). Each unlocks once the previous one is completed.

const BADGE_ICONS = {
  saq_mastery: '📜',
  leq_mastery: '⚖️',
  dbq_mastery: '🗂️',
};

const COURSE_NAMES = {
  saq_mastery: 'The Craft of Three',
  leq_mastery: 'The Art of Argument',
  dbq_mastery: 'Reading the Room',
};

function CourseCard({ course, index, onOpen }) {
  const pct = course.totalLessons ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0;
  const done = !!course.completedAt;
  const locked = !course.unlocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.08, duration: 0.4, ease: 'easeOut' }}
      style={{
        background: GW.parchmentDark,
        border: `1px solid ${done ? GW.sage : GW.amber}40`,
        borderRadius: 16,
        padding: '20px 22px',
        opacity: locked ? 0.6 : 1,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 52, height: 52, flexShrink: 0, borderRadius: 12,
          background: `${GW.amber}22`, border: `1px solid ${GW.amber}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
        }}>{BADGE_ICONS[course.badge] || '📖'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 18, color: GW.ink }}>
            {course.title}
          </div>
          <div style={{ fontSize: 12.5, color: GW.amber, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {course.subtitle}
          </div>
        </div>
        {done && (
          <div style={{
            fontSize: 11.5, fontWeight: 800, color: GW.sage, background: GW.sageSoft,
            borderRadius: 8, padding: '4px 10px', whiteSpace: 'nowrap',
          }}>✓ Complete</div>
        )}
      </div>

      <div style={{ fontSize: 13.5, color: GW.inkSoft, lineHeight: 1.55 }}>{course.description}</div>

      {locked ? (
        <div style={{
          fontSize: 12.5, color: GW.inkSoft, fontStyle: 'italic',
          background: `${GW.ink}08`, borderRadius: 10, padding: '10px 14px',
        }}>
          🔒 Complete <strong>{COURSE_NAMES[course.prereq] || 'the previous course'}</strong> to unlock this one.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 8, borderRadius: 6, background: `${GW.ink}12`, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: GW.amber, borderRadius: 6, transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ fontSize: 12, color: GW.inkSoft, fontWeight: 700, whiteSpace: 'nowrap' }}>
              {course.completedLessons}/{course.totalLessons} lessons
            </div>
          </div>
          <div>
            <GwButton onClick={() => onOpen(course)}>
              {done ? 'Review' : course.completedLessons > 0 ? 'Continue' : 'Start'}
            </GwButton>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function CourseHome() {
  const { navigate } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/write/courses');
        setCourses(res.courses || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onOpen = (course) => {
    navigate('course_lesson', { courseId: course.id, lessonNum: course.currentLesson });
  };

  return (
    <div style={{ minHeight: '100vh', background: GW.parchment }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', background: `${GW.parchment}E8`, backdropFilter: 'blur(6px)',
        borderBottom: `1px solid ${GW.amber}30`,
      }}>
        <button onClick={() => navigate('write_home')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: GW.ink, fontSize: 13, fontWeight: 700, fontFamily: 'Nunito, sans-serif',
          opacity: 0.7, padding: '6px 10px',
        }}>← Back</button>
        <div style={{
          fontFamily: 'Cinzel, serif', fontWeight: 800, letterSpacing: '0.18em',
          fontSize: 13, color: GW.amber, textTransform: 'uppercase',
        }}>Writing Courses</div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(24px, 5vw, 34px)', color: GW.ink, margin: '0 0 8px', fontWeight: 800 }}>
            Sharpen Your Craft
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 14, maxWidth: 440, margin: '0 auto' }}>
            Short, focused lessons that build toward writing a full SAQ, LEQ, and DBQ — each course ends with a Guided Walk capstone.
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', color: GW.inkSoft, fontFamily: 'Georgia, serif', fontStyle: 'italic', padding: 40 }}>
            Loading courses…
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', color: GW.rose, fontWeight: 700, padding: 20 }}>{error}</div>
        )}
        {!loading && !error && courses.map((course, i) => (
          <CourseCard key={course.id} course={course} index={i} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}
