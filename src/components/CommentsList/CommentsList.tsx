import {FC} from "react";
import CommentsItem from "../CommentsItem/CommentsItem";
import styles from "./CommentsList.module.scss";

const CommentsList: FC = () => {
    return (
        <div className={styles.commentsList}>
            <CommentsItem
                userAvatar={""}
                userName={"timo_shka"}
                userActivity={"1 час назад"}
                likesCount={635}
                userComment={
                    "В Календаре появятся более десятка квестов – охота на зомби, битвы с боссами, ритуалы и разное другое. В том числе, там будет целая категория событий, за выполнениние."
                }
            />
        </div>
    );
};

export default CommentsList;
