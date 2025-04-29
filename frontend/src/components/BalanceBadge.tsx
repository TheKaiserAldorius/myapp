import { useUserStore } from '../store/useUserStore';
import './BalanceBadge.scss';


const BalanceBadge = () => {
  const { balance } = useUserStore();

  return (
    <div className="balance-badge">
      <span className="balance-badge__amount">{balance} ⭐</span>
      <button className="balance-badge__topup">+</button>
    </div>
  );
};

export default BalanceBadge;
