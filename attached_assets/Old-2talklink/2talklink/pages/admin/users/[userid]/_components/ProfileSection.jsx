import React from "react";
import styles from "../_styles/ProfileSection.module.css";

export default function ProfileSection({ userDetails }) {
  return (
    <div className={styles.profileSection}>
      <h2>Profile Information</h2>
      <div className={styles.avatarContainer}>
        <img
          src={userDetails?.profilePicture?.file || "/blank-avatar.svg"}
          alt={userDetails?.name}
          className={styles?.avatar}
        />
      </div>
      <div className={styles.details}>
        <p>
          <strong>Name:</strong> {userDetails?.name}
        </p>
        <p>
          <strong>Email:</strong> {userDetails?.email}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={styles[userDetails?.status && "Active".toLowerCase()]}
          >
            {userDetails?.status ? "Active" : "Inactive"}
          </span>
        </p>
        <p>
          <strong>Created At:</strong> {userDetails?.createdAt}
        </p>
        <p>
          <strong>Updated At:</strong> {userDetails?.updatedAt}
        </p>
      </div>
    </div>
  );
}
