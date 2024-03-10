import {FC} from "react";
import CommentsList from "../CommentsList/CommentsList";

import HeadCommentCouner from "../HeadCommentCounter/HeadCommentCouner";
import styles from "./CommentsPage.module.scss";

const CommentsPage: FC = () => {
    return (
        <section className={styles.comments}>
            <div className="container">
                <HeadCommentCouner
                    allCommentsCount={"267"}
                    likesCount={"8 632"}
                />
                <CommentsList />
            </div>
        </section>
    );
};

export default CommentsPage;
