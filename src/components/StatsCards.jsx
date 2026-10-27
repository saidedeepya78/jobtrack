import {
  AwardIcon,
  ClipboardIcon,
  UsersIcon,
  XCircleIcon,
} from './Icons.jsx';

const CARD_DEFINITIONS = [
  {
    key: 'total',
    label: 'Total applications',
    tone: 'blue',
    Icon: ClipboardIcon,
    hint: () => 'All opportunities tracked',
  },
  {
    key: 'interviews',
    label: 'Interviews',
    tone: 'amber',
    Icon: UsersIcon,
    hint: (stats) => `${percentage(stats.interviews, stats.total)}% of all applications`,
  },
  {
    key: 'offers',
    label: 'Offers',
    tone: 'green',
    Icon: AwardIcon,
    hint: (stats) => `${percentage(stats.offers, stats.total)}% of all applications`,
  },
  {
    key: 'rejections',
    label: 'Rejections',
    tone: 'rose',
    Icon: XCircleIcon,
    hint: (stats) => `${percentage(stats.rejections, stats.total)}% of all applications`,
  },
];

function percentage(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export default function StatsCards({ stats, loading }) {
  return (
    <section className="stats-grid" aria-label="Application statistics">
      {CARD_DEFINITIONS.map(({ key, label, tone, Icon, hint }) => (
        <article className={`stat-card stat-card--${tone}`} key={key}>
          <div className="stat-card__top">
            <span className="stat-card__label">{label}</span>
            <span className="stat-card__icon" aria-hidden="true">
              <Icon size={19} />
            </span>
          </div>
          <div className="stat-card__value">
            {loading ? (
              <span className="skeleton skeleton--value" aria-label="Loading" />
            ) : (
              stats[key]
            )}
          </div>
          <p className="stat-card__hint">
            {loading ? 'Loading statistics' : hint(stats)}
          </p>
        </article>
      ))}
    </section>
  );
}
