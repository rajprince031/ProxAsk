import React, { useState } from "react";
import "./AskQuestionModal.css";

const AskQuestionModal = ({ isOpen, onClose }) => {
  const [question, setQuestion] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!question.trim()) {
      setError("Question cannot be empty");
      return;
    }

    setError("");

    // API call will be added by you
    console.log({
      question,
      anonymous,
    });

    setQuestion("");
    setAnonymous(false);
    onClose();
  };

  return (
    <div className="askModalOverlay" onClick={onClose}>
      <div
        className="askModalContainer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="askModalHeader">
          <h3>Ask a Question</h3>
          <button className="closeBtn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="askModalBody">
          {error && <div className="askErrorBox">{error}</div>}

          <textarea
            placeholder="What do you want to ask?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={5}
          />

          <label className="anonymousToggle">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={() => setAnonymous(!anonymous)}
            />
            Ask anonymously
          </label>

          <div className="askModalFooter">
            <button
              type="button"
              className="cancelBtn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="submitBtn">
              Post Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestionModal;
