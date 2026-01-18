import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { dummyProfiles } from "../../utils/dummyProfiles";

import QuestionCard from "../../components/QuestionCard/QuestionCard";
import AskQuestionModal from "../../components/AskQuestionModal/AskQuestionModal";
import "./DashboardLayout.css";

const questionsData = [
    {
        id: 1,
        question: "How to prepare for Spring Boot interviews?",
        askedBy: "Prince Raj",
        askedTo: "Java Developers",
        isAnonymous: false,
        likes: 42,
        comments: 6,
        timestamp: "2 hours ago",
    },
    {
        id: 2,
        question: "Is switching career after 2 years a good idea?",
        askedBy: "",
        askedTo: "Career Mentors",
        isAnonymous: true,
        likes: 12,
        comments: 3,
        timestamp: "5 hours ago",
    },
    {
        id: 3,
        question: "Best way to learn React?",
        askedBy: "Aman",
        askedTo: "Frontend Experts",
        isAnonymous: false,
        likes: 78,
        comments: 10,
        timestamp: "1 day ago",
    },
];
const dummyQuestions = [
    {
        id: 1,
        question: "How to prepare for Spring Boot interviews?",
        askedBy: "Prince Raj",
        askedTo: "Java Developers",
        isAnonymous: false,
        timestamp: "2 hours ago",
        likes: 78,
        comments: 12,
        likedByUser: true,
        isTrending: true,
    },
    {
        id: 2,
        question: "Is switching career after 2 years a good idea?",
        askedBy: "",
        askedTo: "Career Mentors",
        isAnonymous: true,
        timestamp: "5 hours ago",
        likes: 34,
        comments: 6,
        likedByUser: false,
        isTrending: true,
    },
    {
        id: 3,
        question: "Best way to learn React for production projects?",
        askedBy: "Aman Sharma",
        askedTo: "Frontend Experts",
        isAnonymous: false,
        timestamp: "1 day ago",
        likes: 15,
        comments: 3,
        likedByUser: false,
        isTrending: false,
    },
];


const DashboardLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [showAskModal, setShowAskModal] = useState(false);

    return (
        <div className="dashboardRoot">
            <Navbar
                onMenuClick={() => setMobileSidebarOpen(prev => !prev)}
            />

            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
                onAskQuestion={() => setShowAskModal(true)}
            />

            <main
                className={`dashboardContent ${sidebarCollapsed ? "collapsed" : ""
                    }`}
            >
                <div className="dashboardTabs">
                    <button className="tabActive">All</button>
                    <button>Following</button>
                    <button>Trending</button>
                </div>

                <div className="dashboardFeed">
                    {dummyQuestions.map((q) => (
                        <QuestionCard
                            key={q.id}
                            question={q.question}
                            askedBy={q.askedBy}
                            askedTo={q.askedTo}
                            isAnonymous={q.isAnonymous}
                            timestamp={q.timestamp}
                            likes={q.likes}
                            comments={q.comments}
                            likedByUser={q.likedByUser}
                            isTrending={q.isTrending}
                        />
                    ))}
                </div>


            </main>
            <AskQuestionModal
                isOpen={showAskModal}
                onClose={() => setShowAskModal(false)}
            />
        </div>
    );
};

export default DashboardLayout;
