import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FaHeart,
    FaRegHeart,
    FaCommentAlt,
    FaUserSecret,
    FaFire,
} from "react-icons/fa";
import "./QuestionCard.css";

const QuestionCard = ({
    question,
    askedBy,
    askedTo,
    isAnonymous,
    timestamp,
    likes,
    comments,
    likedByUser,
    isTrending,
}) => {


    const navigate = useNavigate();
    return (
        <div className="questionCardRoot">
            {/* Header */}
            <div className="questionCardHeader">
                <div className="questionUserInfo">
                    {isAnonymous ? (
                        <div className="anonymousUser">
                            <FaUserSecret />
                            <span>Anonymous</span>
                        </div>
                    ) : (
                        <div className="normalUser">
                            <span
                                className="askedByName"
                                onClick={() => navigate(`/profile/${askedBy}`)}
                            >
                                {askedBy}
                            </span>

                            {askedTo && (
                                <span className="askedToText">
                                    → asked to <strong>{askedTo}</strong>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="questionMeta">
                    {isTrending && (
                        <span className="trendingBadge">
                            <FaFire /> Trending
                        </span>
                    )}
                    <span className="questionTime">{timestamp}</span>
                </div>
            </div>

            {/* Question Text */}
            <div className="questionText">
                {question}
            </div>

            {/* Actions */}
            <div className="questionActions">
                <div className="actionItem">
                    {likedByUser ? (
                        <FaHeart className="likedIcon" />
                    ) : (
                        <FaRegHeart />
                    )}
                    <span>{likes}</span>
                </div>

                <div className="actionItem">
                    <FaCommentAlt />
                    <span>{comments}</span>
                </div>

                <button className="answerBtn">
                    Answer
                </button>
            </div>
        </div>
    );
};

export default QuestionCard;
