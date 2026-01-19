import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { dummyProfiles } from "../../utils/dummyProfiles";
import QuestionCard from "../../components/QuestionCard/QuestionCard";
import AskQuestionModal from "../../components/AskQuestionModal/AskQuestionModal";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { username } = useParams();

  const loggedInUsername = "princeraj"; // later from AuthContext
  const isOwnProfile = username === loggedInUsername;

  const profile = dummyProfiles.find(
    (p) => p.username === username
  );

  const [activeTab, setActiveTab] = useState("questions");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);

  if (!profile) {
    return <div>Profile not found</div>;
  }

  /* Privacy rule */
  const canViewQuestions =
    profile.profileVisibility === "public" ||
    isOwnProfile ||
    (profile.profileVisibility === "followers" && isFollowing);

  const filteredQuestions = profile.questions
    .filter((q) => {
      if (activeTab === "pinned") return q.pinned;
      if (activeTab === "answers") return q.answered;
      return true;
    })
    .sort((a, b) => b.pinned - a.pinned);

  return (
    <div className="profilePage">
      {/* HEADER */}
      <div className="profileHeader">
        <div className="profileLeft">
          <h2>{profile.name}</h2>
          <p className="username">@{profile.username}</p>
          <p className="bio">{profile.bio}</p>
        </div>

        <div className="profileRight">
          <div className="followStats">
            <div className="statItem">
              <strong>{profile.followers}</strong>
              <span>Followers</span>
            </div>
            <div className="statItem">
              <strong>{profile.following}</strong>
              <span>Following</span>
            </div>
          </div>

          {!isOwnProfile && (
            <div className="profileActions">
              <button
                className={`followBtn ${isFollowing ? "following" : ""}`}
                onClick={() => setIsFollowing((p) => !p)}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>

              {profile.profileVisibility !== "private" && (
                <button className="messageBtn">Message</button>
              )}

              <button
                className="askBtn"
                onClick={() => setShowAskModal(true)}
              >
                Ask
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="profileTabs">
        <button
          className={activeTab === "questions" ? "active" : ""}
          onClick={() => setActiveTab("questions")}
        >
          Questions
        </button>
        <button
          className={activeTab === "answers" ? "active" : ""}
          onClick={() => setActiveTab("answers")}
        >
          Answers
        </button>
        <button
          className={activeTab === "pinned" ? "active" : ""}
          onClick={() => setActiveTab("pinned")}
        >
          Pinned
        </button>
      </div>

      {/* CONTENT */}
      <div className="profileContent">
        {!canViewQuestions ? (
          <div className="privateProfile">
            This profile is private
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q.question}
              askedBy={profile.username}
              askedTo={q.askedTo}
              isAnonymous={false}
              timestamp={q.timestamp}
              likes={q.likes}
              comments={q.comments}
              likedByUser={false}
              isTrending={q.likes >= 30}
            />
          ))
        )}
      </div>

      <AskQuestionModal
        isOpen={showAskModal}
        onClose={() => setShowAskModal(false)}
      />
    </div>
  );
};

export default ProfilePage;
