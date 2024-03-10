import {FC} from "react";
import styles from "./HeadCommentCouner.module.scss";

type HeadCommentCounterProps = {
    allCommentsCount: string;
    likesCount: string;
};

const HeadCommentCouner: FC<HeadCommentCounterProps> = ({
    allCommentsCount,
    likesCount,
}) => {
    return (
        <div className={styles.headCounterWrapper}>
            <span className={styles.allCommentCounter}>
                {allCommentsCount} комментариев
            </span>
            <div className={styles.allLikesWrapper}>
                <img
                    className={styles.allLikesImg}
                    src="/comments-page/all-likes.svg"
                    alt=".Все лайки"
                />
                <span className={styles.likesCount}>{likesCount}</span>
            </div>
        </div>
    );
};

export default HeadCommentCouner;
