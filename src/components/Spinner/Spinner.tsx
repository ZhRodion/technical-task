import {FC} from "react";
import styles from "./Spinner.module.scss";

const Spinner: FC = () => {
    return (
        <div className={styles.spinnerWrapper}>
            <div className={styles.spinner}>
                <div className={styles.spinnerInner} />
            </div>
        </div>
    );
};

export default Spinner;
