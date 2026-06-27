
import { useAppContext } from '../context/AppContext';

const SectionCard = ({ title, subtitle, children, action }) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export default SectionCard;