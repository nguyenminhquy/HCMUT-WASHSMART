import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, CreditCard, Gauge, Sparkles, TimerReset } from "lucide-react";

const quickActions = [
  { href: "/dang-ky-rua-xe", label: "Đăng ký rửa xe" },
  { href: "/thanh-toan", label: "Thanh toán" },
  { href: "/dang-ky", label: "Đăng ký tài khoản" },
  { href: "/lookup", label: "Tra cứu lịch hẹn" }
];

const trustStats = [
  { value: "3", label: "Chi nhánh đang hoạt động" },
  { value: "2,400+", label: "Lượt đặt mỗi tháng" },
  { value: "4.9/5", label: "Đánh giá khách hàng" }
];

const features = [
  {
    icon: CalendarClock,
    title: "Đặt lịch nhanh",
    text: "Chọn chi nhánh, dịch vụ và giờ trống theo thời gian thực trong chưa đến 1 phút."
  },
  {
    icon: TimerReset,
    title: "Theo dõi minh bạch",
    text: "Tra cứu lịch hẹn bằng số điện thoại và mã đặt lịch, cập nhật trạng thái rõ ràng."
  },
  {
    icon: CreditCard,
    title: "Thanh toán tiện lợi",
    text: "Hỗ trợ nhiều phương thức thanh toán, xác nhận lịch hẹn ngay sau giao dịch."
  }
];

export default function HomePage() {
  return (
    <div className="section-stack">
      <section className="glass-shell hero-spotlight section-spacing">
        <div className="grid items-start gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rise-item">
            <span className="neon-pill">
              <Sparkles className="h-3.5 w-3.5" />
              Nền tảng rửa xe hiện đại
            </span>

            <h1 className="type-h1 mt-4 max-w-3xl">Đặt lịch rửa xe thông minh, nhanh và rõ ràng từng bước.</h1>

            <p className="type-body mt-4 max-w-2xl">
              HCMUT-WASHSMART giúp bạn đặt lịch trong vài thao tác, theo dõi trạng thái dễ dàng và thanh toán ngay trên một giao diện tiếng Việt
              tối ưu cho cả điện thoại và máy tính.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dang-ky-rua-xe" className="btn-primary-ui btn-lg-ui">
                Đặt lịch ngay
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dang-nhap" className="btn-secondary-ui btn-lg-ui">
                Đăng nhập
              </Link>
            </div>

            <ul className="mt-6 grid gap-2 sm:grid-cols-3">
              <li className="flex items-center gap-2 rounded-lg border border-white/80 bg-white/80 px-3 py-2 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                Cập nhật slot theo thời gian thực
              </li>
              <li className="flex items-center gap-2 rounded-lg border border-white/80 bg-white/80 px-3 py-2 text-sm text-slate-700">
                <Gauge className="h-4 w-4 shrink-0 text-cyan-700" />
                Quy trình đặt lịch dưới 60 giây
              </li>
              <li className="flex items-center gap-2 rounded-lg border border-white/80 bg-white/80 px-3 py-2 text-sm text-slate-700">
                <CreditCard className="h-4 w-4 shrink-0 text-sky-700" />
                Hỗ trợ thanh toán đa phương thức
              </li>
            </ul>
          </div>

          <aside className="ui-card ui-card-pad rise-item bg-white/84">
            <p className="type-small uppercase tracking-[0.16em]">Quick actions</p>
            <h2 className="type-h3 mt-2">Lối tắt nhanh</h2>
            <p className="type-body mt-2">Đi thẳng đến tác vụ bạn cần mà không làm phân tán trọng tâm của hero.</p>

            <div className="mt-4 grid gap-2">
              {quickActions.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="btn-ghost-ui btn-md-ui justify-start rounded-lg border border-slate-200/90 bg-white/86 px-3"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {trustStats.map((item) => (
          <div key={item.label} className="ui-card ui-card-pad">
            <p className="type-small">{item.label}</p>
            <p className="type-h2 mt-1">{item.value}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-5 md:mb-6">
          <p className="type-small uppercase tracking-[0.16em]">Tính năng nổi bật</p>
          <h2 className="type-h2 mt-2">Một trải nghiệm nhất quán từ đặt lịch đến thanh toán</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="ui-card ui-card-pad ui-card-hover flex h-full flex-col">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="type-h3 mt-4">{item.title}</h3>
                <p className="type-body mt-2">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="radius-rule bg-gradient-to-r from-cyan-600 via-sky-600 to-emerald-600 p-6 text-white shadow-rule md:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-white/80">Sẵn sàng bắt đầu</p>
        <h2 className="mt-2 font-[var(--font-space-grotesk)] text-2xl font-bold leading-tight md:text-3xl">
          Đặt lịch ngay hôm nay để hệ thống tự động giữ chỗ cho xe của bạn.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-base">
          Luồng thao tác gọn, giao diện rõ ràng, xác nhận nhanh. Bạn có thể đặt lịch mới hoặc đăng nhập để quản lý lịch hẹn hiện có.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dang-ky-rua-xe" className="btn-md-ui inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 font-semibold text-slate-900 transition hover:bg-slate-100">
            Đặt lịch rửa xe
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/dang-nhap" className="btn-md-ui inline-flex items-center justify-center rounded-xl border border-white/60 px-4 font-semibold text-white transition hover:bg-white/10">
            Đăng nhập tài khoản
          </Link>
        </div>
      </section>
    </div>
  );
}
