import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProgressBar, Tabs } from '@/components/common/UI';

const FUND_TABS = [
  { id: 'os', label: '🖥️ OS' },
  { id: 'dbms', label: '🗄️ DBMS' },
  { id: 'cn', label: '🌐 Networks' },
  { id: 'oops', label: '🔷 OOP' },
  { id: 'system-design', label: '🏗️ System Design' }
];

const CONTENT = {
  os: {
    icon: '🖥️', title: 'Operating Systems',
    topics: [
      { name: 'Process & Thread Management', progress: 85, subtopics: ['Process states', 'Context switching', 'Thread vs Process', 'Multithreading'] },
      { name: 'CPU Scheduling', progress: 70, subtopics: ['FCFS', 'SJF', 'Round Robin', 'Priority Scheduling'] },
      { name: 'Memory Management', progress: 65, subtopics: ['Paging', 'Segmentation', 'Virtual Memory', 'Page Replacement'] },
      { name: 'Deadlocks', progress: 55, subtopics: ['Conditions', 'Prevention', 'Avoidance', 'Banker\'s Algorithm'] },
      { name: 'File Systems', progress: 72, subtopics: ['Inode', 'FAT', 'Ext4', 'NTFS'] }
    ],
    faqs: [
      { q: 'What is the difference between process and thread?', a: 'A process is an independent program with its own memory space. A thread is a lightweight unit within a process, sharing memory. Threads are faster to create but require synchronization.' },
      { q: 'What are the four conditions for deadlock?', a: 'Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. All four must be present simultaneously for a deadlock to occur.' },
      { q: 'Explain virtual memory.', a: 'Virtual memory allows programs to use more memory than physically available by using disk space as extended RAM. The OS manages page swapping between RAM and disk.' }
    ]
  },
  dbms: {
    icon: '🗄️', title: 'Database Management',
    topics: [
      { name: 'SQL Fundamentals', progress: 90, subtopics: ['SELECT, INSERT, UPDATE, DELETE', 'Joins', 'Subqueries', 'Aggregate functions'] },
      { name: 'Normalization', progress: 75, subtopics: ['1NF, 2NF, 3NF, BCNF', 'Functional Dependencies', 'Denormalization'] },
      { name: 'Transactions & ACID', progress: 68, subtopics: ['Atomicity', 'Consistency', 'Isolation', 'Durability'] },
      { name: 'Indexing', progress: 60, subtopics: ['B+ Tree Index', 'Hash Index', 'Clustered vs Non-clustered'] },
      { name: 'NoSQL Databases', progress: 50, subtopics: ['MongoDB', 'Redis', 'Cassandra', 'CAP Theorem'] }
    ],
    faqs: [
      { q: 'What is the difference between INNER JOIN and LEFT JOIN?', a: 'INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right; unmatched are NULL.' },
      { q: 'Explain ACID properties.', a: 'Atomicity (all or nothing), Consistency (data remains valid), Isolation (transactions don\'t interfere), Durability (committed transactions persist).' },
      { q: 'What is database normalization?', a: 'Normalization is the process of organizing data to reduce redundancy and improve integrity. Forms: 1NF (atomic values), 2NF (no partial dependency), 3NF (no transitive dependency).' }
    ]
  },
  cn: {
    icon: '🌐', title: 'Computer Networks',
    topics: [
      { name: 'OSI & TCP/IP Model', progress: 78, subtopics: ['7 OSI Layers', '4 TCP/IP Layers', 'Data flow', 'Encapsulation'] },
      { name: 'Transport Layer', progress: 72, subtopics: ['TCP vs UDP', '3-way handshake', 'Congestion control', 'Flow control'] },
      { name: 'Network Layer', progress: 65, subtopics: ['IP addressing', 'Subnetting', 'CIDR', 'Routing protocols'] },
      { name: 'Application Layer', progress: 80, subtopics: ['HTTP/HTTPS', 'DNS', 'FTP', 'SMTP'] },
      { name: 'Network Security', progress: 55, subtopics: ['SSL/TLS', 'Firewalls', 'VPN', 'Cryptography basics'] }
    ],
    faqs: [
      { q: 'What is the difference between TCP and UDP?', a: 'TCP is connection-oriented, reliable, ordered, and slower. UDP is connectionless, unreliable, faster, and used for streaming/gaming.' },
      { q: 'Explain the 3-way TCP handshake.', a: 'SYN → Client sends synchronize. SYN-ACK → Server acknowledges. ACK → Client confirms. Connection established.' },
      { q: 'What is DNS and how does it work?', a: 'DNS maps domain names to IP addresses. Resolution: local cache → recursive resolver → root server → TLD server → authoritative server.' }
    ]
  },
  oops: {
    icon: '🔷', title: 'Object-Oriented Programming',
    topics: [
      { name: 'Core OOP Concepts', progress: 88, subtopics: ['Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism'] },
      { name: 'SOLID Principles', progress: 72, subtopics: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution', 'Interface Segregation', 'Dependency Inversion'] },
      { name: 'Design Patterns', progress: 60, subtopics: ['Singleton', 'Factory', 'Observer', 'Strategy', 'Decorator'] },
      { name: 'Advanced Concepts', progress: 55, subtopics: ['Abstract classes', 'Interfaces', 'Multiple inheritance', 'Method overriding'] }
    ],
    faqs: [
      { q: 'What are the four pillars of OOP?', a: 'Encapsulation (data hiding), Abstraction (hiding complexity), Inheritance (code reuse), Polymorphism (same interface, different behaviors).' },
      { q: 'Explain the Single Responsibility Principle.', a: 'A class should have only one reason to change — it should have only one job or responsibility.' },
      { q: 'What is the difference between abstract class and interface?', a: 'Abstract class can have implementation and state; interface only defines contracts. A class can implement multiple interfaces but extend only one abstract class.' }
    ]
  },
  'system-design': {
    icon: '🏗️', title: 'System Design',
    topics: [
      { name: 'Scalability Concepts', progress: 55, subtopics: ['Horizontal vs Vertical scaling', 'Load balancing', 'CDN', 'Caching strategies'] },
      { name: 'Database Design', progress: 65, subtopics: ['SQL vs NoSQL', 'Sharding', 'Replication', 'CAP theorem'] },
      { name: 'Common System Designs', progress: 40, subtopics: ['URL shortener', 'Twitter feed', 'Rate limiter', 'Chat system'] },
      { name: 'Microservices', progress: 48, subtopics: ['Service decomposition', 'API gateway', 'Service discovery', 'Event-driven'] }
    ],
    faqs: [
      { q: 'How would you design a URL shortener?', a: 'Key components: Hash generation (base62 encoding), Database (store long→short mapping), Cache (Redis for hot URLs), Load balancer, Analytics.' },
      { q: 'Explain the CAP theorem.', a: 'A distributed system can guarantee at most 2 of 3: Consistency (same data everywhere), Availability (always responds), Partition Tolerance (works despite network failures).' }
    ]
  }
};

export default function FundamentalsPage() {
  const [tab, setTab] = useState('os');
  const content = CONTENT[tab];

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">💻 CS Fundamentals</h1>
          <p className="text-sm text-secondary mt-0.5">OS, DBMS, Networks, OOP & System Design</p>
        </div>
        <Link to="/ai-tutor" className="btn-primary text-xs">🤖 Ask AI Tutor</Link>
      </div>

      <Tabs tabs={FUND_TABS} active={tab} onChange={setTab} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Topics */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{content.icon}</span>
              <div>
                <div className="text-base font-bold">{content.title}</div>
                <div className="text-xs text-muted">{content.topics.length} main topics</div>
              </div>
            </div>
            <div className="space-y-4">
              {content.topics.map((t, i) => (
                <div key={i} className="p-3 bg-surface3 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{t.name}</span>
                    <span className={`text-xs font-semibold ${t.progress >= 75 ? 'text-emerald-400' : t.progress >= 55 ? 'text-amber-400' : 'text-red-400'}`}>{t.progress}%</span>
                  </div>
                  <ProgressBar value={t.progress} max={100} color={t.progress >= 75 ? 'green' : t.progress >= 55 ? 'amber' : 'red'} className="mb-2" />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.subtopics.map(s => <span key={s} className="text-[10px] bg-surface3 text-secondary px-2 py-0.5 rounded">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Panel */}
        <div className="space-y-4">
          <div className="card">
            <div className="text-sm font-semibold mb-4">❓ Common Interview Questions</div>
            <div className="space-y-4">
              {content.faqs.map((faq, i) => (
                <details key={i} className="group">
                  <summary className="text-sm font-medium cursor-pointer text-secondary hover:text-white list-none flex items-start gap-2">
                    <span className="text-accent mt-0.5 flex-shrink-0">Q.</span>
                    {faq.q}
                  </summary>
                  <div className="mt-2 ml-4 text-xs text-secondary leading-relaxed border-l-2 border-accent/30 pl-3">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="text-sm font-semibold mb-3">🎯 Practice Questions</div>
            <Link
              to="/tests?category=cs-fundamentals"
              className="btn-primary w-full justify-center text-xs mb-2"
            >
              📝 Take CS Fundamentals Test
            </Link>
            <Link
              to="/ai-tutor"
              className="btn-outline w-full justify-center text-xs"
            >
              🤖 Discuss with AI Tutor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
