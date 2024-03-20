import moment from "moment";
import {FC, useEffect, useState} from "react";
import getAuthorsRequest from "src/api/authors/getAuthorsRequest";
import getCommentsRequest from "src/api/comments/getCommentsRequest";
import CommentsItem, {CommentItemProps} from "../CommentsItem/CommentsItem";
import Spinner from "../Spinner/Spinner";
import styles from "./CommentsList.module.scss";

const CommentsList: FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    // Обновление массива комментов
    const [comments, setComments] = useState<any[]>([]);
    // Есть ли ошибка
    const [error, setError] = useState<string | null>(null);
    // Переключение страницы
    let [page, setPage] = useState<number>(1);
    // Есть ли еще комменты
    const [hasMoreComments, setHasMoreComments] = useState<boolean>(true);
    // Повтор
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                // Параллельное выполнение промисов
                const [authorsData, commentsData] = await Promise.all([
                    getAuthorsRequest(),
                    getCommentsRequest(page),
                ]);
                // Подбор автора по id
                const authorsMap = authorsData.reduce(
                    (map: any, author: any) => {
                        map[author.id] = author;
                        return map;
                    },
                    {},
                );
                // Порядок сортировки
                const sortedComments = commentsData.data.sort(
                    (a: any, b: any) => (a.parent || 0) - (b.parent || 0),
                );
                // Приводим к формату Comment интерфейса и рекурсией собираем комменеты рекурсией
                const processComment = (comment: any): CommentItemProps => {
                    // Перевод в корректный формат времени при помощи time.js lib
                    const formattedCreated = moment(comment.created).format(
                        "DD MMMM YYYY HH:mm",
                    );
                    const processedComment: CommentItemProps = {
                        id: comment.id,
                        avatar: authorsMap[comment.author]?.avatar || "",
                        name: authorsMap[comment.author]?.name || "",
                        // Вставка времени в формате день-месяц-год-час
                        created: formattedCreated,
                        likes: comment.likes,
                        text: comment.text,
                        nestedComments: [],
                    };
                    // Если длинна вложенных комментов >0 - собираем комменты вложенные
                    const nestedComments = getNestedComments(
                        comment.id,
                        sortedComments,
                        authorsMap,
                    );
                    // Когда = 0, остановка рекурсии
                    if (nestedComments.length > 0) {
                        processedComment.nestedComments = nestedComments;
                    }

                    return processedComment;
                };
                // Рекурсией получаем вложенные комменты (проходится по всем комментам и добавляет вложенные к родительским)
                const getNestedComments = (
                    parentId: number,
                    comments: any[],
                    authorsMap: any,
                ): CommentItemProps[] => {
                    const nested: CommentItemProps[] = [];
                    // Если comments перебраны - остановка рекурсии
                    for (const comment of comments) {
                        // Перевод в корректный формат времени при помощи time.js lib
                        const formattedCreated = moment(comment.created).format(
                            "DD MMMM YYYY HH:mm",
                        );
                        // Если нет вложенных комментов - рекурсия останавливается
                        if (comment.parent === parentId) {
                            nested.push({
                                id: comment.id,
                                avatar:
                                    authorsMap[comment.author]?.avatar || "",
                                name: authorsMap[comment.author]?.name || "",
                                // Вставка времени в формате день-месяц-год-час
                                created: formattedCreated,
                                likes: comment.likes,
                                text: comment.text,
                                nestedComments: getNestedComments(
                                    comment.id,
                                    comments,
                                    authorsMap,
                                ),
                            });
                        }
                    }
                    // console.log(nested);
                    return nested;
                };
                // Фильтруем и возвращаем комменты
                const processedComments = sortedComments
                    .filter((comment: any) => !comment.parent)
                    .map(processComment);
                // Обновляем комменты
                setComments((prevComments) => [
                    ...prevComments,
                    ...processedComments,
                ]);

                setLoading(false);
            } catch (error: any) {
                // Если страницы в бд кончились страницы
                if (error.response?.status === 404) {
                    setError("Комментарии закончились");
                    setLoading(false);
                    setHasMoreComments(false);
                    console.error("Ошибка загрузки данных:", error);
                    // Если выдает ошибку соединения с бд
                } else if (retryCount < 3) {
                    setRetryCount(retryCount + 1);
                    console.log("Повторный запрос...");
                    fetchComments();
                }
            }
        };
        fetchComments();
    }, [page]);
    // Переключение страницы
    const handleSwitchCommentPage = () => {
        setPage((page += 1));
        // console.log(page);
    };

    return (
        <div className={styles.commentsWrapper}>
            <div className={styles.commentsList}>
                {loading ? (
                    <Spinner />
                ) : (
                    comments.map((item, index) => (
                        <CommentsItem
                            key={`${item.id} - ${index}`}
                            id={item.id}
                            avatar={item.avatar}
                            name={item.name}
                            created={item.created}
                            likes={item.likes}
                            text={item.text}
                            nestedComments={item.nestedComments}
                        />
                    ))
                )}
            </div>
            <button
                className={styles.addMore}
                onClick={handleSwitchCommentPage}
                disabled={!hasMoreComments}
                type="button"
            >
                Загрузить еще
            </button>
            {error ? <p className={styles.errText}>{error}</p> : ""}
        </div>
    );
};

export default CommentsList;
