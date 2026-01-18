import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dummyProfiles } from "../../utils/dummyProfiles";
import QuestionCard from "../../components/QuestionCard/QuestionCard";
import AskQuestionModal from "../../components/AskQuestionModal/AskQuestionModal";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const loggedInUsername = "princeraj"; // later from AuthContext
  const isOwnProfile = username === loggedInUsername;

  const profile = dummyProfiles.find((p) => p.username === username);

  const [activeTab, setActiveTab] = useState("questions");
  const [showAskModal, setShowAskModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  if (!profile) {
    return <div className="profileNotFound">Profile not found</div>;
  }

  /* Profile visibility */
  const canViewQuestions =
    profile.profileVisibility === "public" ||
    isOwnProfile ||
    (profile.profileVisibility === "followers" && isFollowing);

  const canClickFollowList =
    isOwnProfile ||
    profile.profileVisibility === "public" ||
    (profile.profileVisibility === "followers" && isFollowing);

  /* Tabs logic */
  const questions = profile.questions
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
          <div className="profileNameRow">
            <h2>{profile.name}</h2>
            <span
              className={`statusDot ${
                profile.online ? "online" : "offline"
              }`}
            />
          </div>
          <p className="username">@{profile.username}</p>
          <p className="bio">{profile.bio}</p>
        </div>

        <div className="profileRight">
          {/* Followers / Following */}
          <div className="followStats">
            <div
              className={`statItem ${
                canClickFollowList ? "clickable" : "disabled"
              }`}
              onClick={() =>
                canClickFollowList &&
                navigate(`/profile/${username}/followers`)
              }
            >
              <strong>{profile.followers}</strong>
              <span>Followers</span>
            </div>

            <div
              className={`statItem ${
                canClickFollowList ? "clickable" : "disabled"
              }`}
              onClick={() =>
                canClickFollowList &&
                navigate(`/profile/${username}/following`)
              }
            >
              <strong>{profile.following}</strong>
              <span>Following</span>
            </div>
          </div>

          {/* Actions */}
          {!isOwnProfile && (
            <div className="profileActions">
              <button
                className={`followBtn ${isFollowing ? "following" : ""}`}
                onClick={() => setIsFollowing((prev) => !prev)}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>

              {profile.profileVisibility !== "private" && (
                <button
                  className="messageBtn"
                  onClick={() => navigate("/messages")}
                >
                  Message
                </button>
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
            This profile is private.
          </div>
        ) : (
          questions.map((q) => (
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

      {/* ASK QUESTION MODAL */}
      <AskQuestionModal
        isOpen={showAskModal}
        onClose={() => setShowAskModal(false)}
      />
    </div>
  );
};

export default ProfilePage;
