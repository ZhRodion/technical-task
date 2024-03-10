import {FC} from "react";
import styles from "./CommentsItem.module.scss";

interface CommentItemProps {
    userAvatar: string;
    userName: string;
    userActivity: string;
    likesCount: number;
    userComment: string;
}

const CommentsItem: FC<CommentItemProps> = ({
    userAvatar,
    userName,
    userActivity,
    likesCount,
    userComment,
}) => {
    return (
        <div className={styles.commentItem}>
            <img
                className={styles.userAvatar}
                src={userAvatar}
                alt=".Аватар пользователя"
            />
            <div className={styles.userCommentWrapper}>
                <div className={styles.userCommentInfo}>
                    <div className={styles.userCommentNameWrapper}>
                        <span className={styles.userCommentName}>
                            {userName}
                        </span>
                        <p className={styles.userActivity}>{userActivity}</p>
                    </div>
                    <div className={styles.commentLikesCountWrapper}>
                        <span className={styles.userCommentCount}>
                            {likesCount}
                        </span>
                    </div>
                </div>
                <p className={styles.commentText}>{userComment}</p>
            </div>
        </div>
    );
};

export default CommentsItem;
