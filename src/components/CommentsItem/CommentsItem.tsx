import {FC} from "react";
import styles from "./CommentsItem.module.scss";
export interface CommentItemProps {
    id: number;
    avatar: string;
    name: string;
    created: string;
    likes: number;
    text: string;
    nestedComments?: CommentItemProps[];
}

const CommentsItem: FC<CommentItemProps> = ({
    avatar,
    name,
    created,
    likes,
    text,
    nestedComments = [],
}) => {
    return (
        <div className={styles.commentItemWrapper}>
            <div className={styles.commentItem}>
                <img
                    className={styles.userAvatar}
                    src={avatar}
                    alt=".Аватар пользователя"
                />
                <div className={styles.userCommentWrapper}>
                    <div className={styles.userCommentInfo}>
                        <div className={styles.userCommentNameWrapper}>
                            <span className={styles.userCommentName}>
                                {name}
                            </span>
                            <p className={styles.userActivity}>{created}</p>
                        </div>
                        <div className={styles.commentLikesCountWrapper}>
                            <span className={styles.userCommentCount}>
                                {likes}
                            </span>
                        </div>
                    </div>
                    <p className={styles.commentText}>{text}</p>
                </div>
            </div>
            {nestedComments.length > 0 && (
                <div className={styles.nestedComments}>
                    {nestedComments.map((item, index) => (
                        <CommentsItem key={`${item.id} - ${index}`} {...item} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentsItem;
