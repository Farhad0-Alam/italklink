import CountUp from "react-countup";
import styles from "./score-display.module.css";
import { elements as MainElements } from "./element-sidebar";
export default function ScoreDisplay({ score, elements }) {
  const scoreIndex =
    elements.filter(
      (obj, index, self) =>
        index === self.findIndex((item) => item.type === obj.type)
    ).length - 1;
  const targetedPerScore = Number(
    Number(100 / MainElements?.length).toFixed(2)
  );
  const start = Math.floor(targetedPerScore * scoreIndex);
  // console.log(start);

  return (
    <div className={styles.scoreContainer}>
      <div className={styles.score}>
        <h3 className={styles.title}>Design Score</h3>
        <div className={styles.valueWrapper}>
          <p className={styles.value}>
            
            <CountUp
              start={start > 1 ? Math.abs(start) : 0}
              end={Math.abs(score)}
            />
          </p>
          <span className={styles.maxScore}>/100</span>
        </div>
      </div>
    </div>
  );
}
