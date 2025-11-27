import PlanForm from "../_components/PlanForm";
import styles from "../_styles/PageContainer.module.css";
export default function Page() {
  return (
    <div className={styles.container}>
      <PlanForm />
    </div>
  );
}
