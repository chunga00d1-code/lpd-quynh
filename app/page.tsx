"use client";

import { useState, useEffect, useRef } from "react";

const Arrow = () => <span aria-hidden="true">→</span>;

const TikTokIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1.1em" width="1.1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px" }} xmlns="http://www.w3.org/2000/svg">
    <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"></path>
  </svg>
);



const FacebookIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1.1em" width="1.1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px" }} xmlns="http://www.w3.org/2000/svg">
    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path>
  </svg>
);

const STATS = [
  { label: "Khách hàng hài lòng", value: 500, suffix: "+", decimals: 0 },
  { label: "Bộ nail hoàn thiện", value: 1200, suffix: "+", decimals: 0 },
  { label: "Đánh giá trung bình", value: 4.9, suffix: "/5", decimals: 1 },
  { label: "Năm kinh nghiệm", value: 3, suffix: "+", decimals: 0 },
];

const MARQUEE_ITEMS = [
  "★★★★★ Dịch vụ tận tâm",
  "★★★★★ Không gian thư giãn",
  "★★★★★ Mẫu nail đẹp, bền màu",
  "★★★★★ Nhân viên chuyên nghiệp",
  "★★★★★ Đặt lịch dễ dàng",
];

// Chuyển đổi trạng thái modal admin qua View Transition API cho hiệu ứng
// crossfade mượt (khi trình duyệt hỗ trợ và người dùng không tắt hiệu ứng chuyển động).
const runViewTransition = (apply: () => void) => {
  const supportsViewTransition =
    typeof document !== "undefined" && "startViewTransition" in document;
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (supportsViewTransition && !reducedMotion) {
    (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(apply);
  } else {
    apply();
  }
};

// Magnetic tilt: thẻ nghiêng nhẹ theo hướng con trỏ chuột, mượt & "cao cấp" hơn hover phẳng
const handleCardTilt = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width - 0.5;
  const py = (e.clientY - rect.top) / rect.height - 0.5;
  const maxTilt = 7;
  el.style.transition = "transform .08s linear";
  el.style.transform = `perspective(800px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) translateY(-6px) scale(1.015)`;
};
const resetCardTilt = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  el.style.transition = "transform .5s cubic-bezier(0.16, 1, 0.3, 1)";
  el.style.transform = "perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)";
};

// Tách chuỗi thành từng chữ, mỗi chữ có delay riêng để tạo hiệu ứng reveal theo từng từ.
// Đặt trong khối cha có class "reveal" (đã được IntersectionObserver quản lý sẵn).
const SplitWords = ({ text, startDelay = 0 }: { text: string; startDelay?: number }) => (
  <>
    {text.split(" ").map((word, i) => (
      <span className="word-mask" key={`${word}-${i}`}>
        <span className="word-inner" style={{ transitionDelay: `${startDelay + i * 0.045}s` }}>
          {word}&nbsp;
        </span>
      </span>
    ))}
  </>
);

interface Service {
  _id: string;
  icon?: string;
  name: string;
  text?: string;
  price: string;
  imageUrl?: string;
  order?: number;
}

interface Look {
  _id: string;
  className: string;
  title: string;
  tag: string;
  imageUrl?: string;
}

interface Booking {
  _id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  status: string;
}

interface Settings {
  salonName: string;
  phone: string;
  email: string;
  address: string;
  openHours: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  heroTitle: string;
  heroText: string;
  aboutText: string;
}

const DEFAULT_SERVICES: Service[] = [
  { _id: "1", icon: "✦", name: "Sơn gel cao cấp", text: "Bảng màu thời thượng, bền đẹp và sáng bóng.", price: "Từ 180.000đ", imageUrl: "" },
  { _id: "2", icon: "◇", name: "Nail art thiết kế", text: "Mỗi bộ móng là một thiết kế dành riêng cho bạn.", price: "Từ 250.000đ", imageUrl: "" },
  { _id: "3", icon: "○", name: "Chăm sóc móng", text: "Làm sạch, dưỡng móng và thư giãn nhẹ nhàng.", price: "Từ 150.000đ", imageUrl: "" },
];

const DEFAULT_LOOKS: Look[] = [
  { _id: "1", className: "look-burgundy", title: "Burgundy Pearl", tag: "Sang trọng", imageUrl: "" },
  { _id: "2", className: "look-milk", title: "Milky Chrome", tag: "Tinh tế", imageUrl: "" },
  { _id: "3", className: "look-french", title: "Modern French", tag: "Tối giản", imageUrl: "" },
];

const DEFAULT_SETTINGS: Settings = {
  salonName: "Quỳnh Nail ART",
  phone: "0383088262",
  email: "hello@quynhnail.vn",
  address: "số nhà 81, Nam Lý, Trung Giã, Hà Nội",
  openHours: "08:00 — 20:00 · Thứ 2 — Chủ nhật",
  instagramUrl: "#",
  facebookUrl: "https://www.facebook.com/nguyen.quynh.597831",
  tiktokUrl: "https://www.tiktok.com/@2uyn21",
  heroTitle: "Nâng niu từng đầu ngón tay",
  heroText: "Tôn lên nét riêng của bạn với những bộ nail được chăm chút tỉ mỉ trong không gian thư thái, hiện đại.",
  aboutText: "Quỳnh tin rằng thời gian làm nail cũng là lúc bạn dành một khoảng nghỉ cho chính mình. Vì vậy, mỗi trải nghiệm đều được thiết kế để thật chỉn chu, sạch sẽ và thoải mái."
};

export default function Home() {
  // DB loaded states
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [looks, setLooks] = useState<Look[]>(DEFAULT_LOOKS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Booking form states
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingService, setBookingService] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Admin auth states
  const [showAdminPortal, setShowAdminPortal] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeAdminTab, setActiveAdminTab] = useState<"bookings" | "services" | "looks" | "settings">("bookings");

  // Admin session token
  const [sessionToken, setSessionToken] = useState("");

  // Header scroll detection state
  const [isScrolled, setIsScrolled] = useState(false);

  // Tiến trình cuộn trang (0-1), dùng cho thanh progress bar dính đầu trang
  const [scrollProgress, setScrollProgress] = useState(0);

  // Giá trị số liệu đang đếm lên trong khối thống kê
  const [statValues, setStatValues] = useState<number[]>(STATS.map(() => 0));
  const statsAnimatedRef = useRef(false);

  // Vị trí % của thanh kéo so sánh trước/sau trên ảnh hero
  const [sliderPos, setSliderPos] = useState(50);
  const heroArtRef = useRef<HTMLDivElement>(null);

  // Active section for nav highlighting while scrolling
  const [activeSection, setActiveSection] = useState("home");

  // Preloaded look images, for skeleton-to-loaded transition
  const [loadedLookImages, setLoadedLookImages] = useState<Record<string, boolean>>({});

  // Add/Edit forms
  const [serviceForm, setServiceForm] = useState({ id: "", name: "", text: "", price: "", icon: "✦", imageUrl: "", order: 0 });
  const [lookForm, setLookForm] = useState({ title: "", tag: "", className: "look-burgundy", imageUrl: "" });
  const [settingsForm, setSettingsForm] = useState<Settings>(DEFAULT_SETTINGS);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Intersection Observer scroll reveal hook
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll(".reveal, .card-reveal");
    elements.forEach((el) => {
      // Clear previous revealed class so elements animate when content loads and pushes them down
      el.classList.remove("revealed");
      observer.observe(el);
    });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [services, looks, settings]);

  // Active section detection, dùng để highlight đúng mục trên nav khi cuộn
  useEffect(() => {
    const navIds = ["home", "services", "about", "gallery", "contact"];
    const sectionEls = navIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sectionEls.forEach((el) => sectionObserver.observe(el));

    return () => sectionEls.forEach((el) => sectionObserver.unobserve(el));
  }, [services, looks, settings]);

  // Preload look images for a mượt skeleton -> loaded transition
  useEffect(() => {
    looks.forEach((look) => {
      const id = look._id || look.title;
      if (!look.imageUrl || loadedLookImages[id]) return;
      const img = new Image();
      img.src = look.imageUrl;
      img.onload = () => setLoadedLookImages((prev) => ({ ...prev, [id]: true }));
    });
    // loadedLookImages intentionally excluded: it's checked, not reacted to, to avoid re-preloading on every load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [looks]);

  // Parallax nhẹ cho ảnh hero và các thẻ gallery khi cuộn trang
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const heroArt = document.querySelector<HTMLElement>(".hero-art");
    const lookEls = Array.from(document.querySelectorAll<HTMLElement>(".look-card"));
    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY;
      if (heroArt) {
        const offset = Math.min(scrollY * 0.12, 60);
        const zoomProgress = Math.min(scrollY / (window.innerHeight || 800), 1);
        const scale = 1 + zoomProgress * 0.14;
        heroArt.style.transform = `translateY(${offset}px) scale(${scale.toFixed(3)})`;
      }
      const vh = window.innerHeight;
      lookEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        const shift = Math.max(-24, Math.min(24, progress * 32));
        el.style.backgroundPositionY = `calc(50% + ${shift}px)`;
      });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [looks]);

  // Custom cursor: chấm theo chuột + vòng tròn trễ nhẹ, phóng to khi hover phần tử tương tác
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = document.querySelector<HTMLElement>(".cursor-dot");
    const ring = document.querySelector<HTMLElement>(".cursor-ring");
    if (!dot || !ring) return;

    document.body.classList.add("custom-cursor-active");

    const onMove = (e: MouseEvent) => {
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      ring.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };

    const interactiveSelector = "a, button, .card-reveal, .header-book, .text-link, input, textarea, select, [role='button']";
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(interactiveSelector)) {
        ring.classList.add("cursor-ring-active");
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(interactiveSelector)) {
        ring.classList.remove("cursor-ring-active");
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  // Scroll listener hook
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đếm số liệu thống kê chạy lên khi khối stats xuất hiện trong khung nhìn
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTimeout(() => {
        setStatValues(STATS.map((s) => s.value));
      }, 0);
      return;
    }
    const section = document.querySelector<HTMLElement>(".stats");
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimatedRef.current) {
            statsAnimatedRef.current = true;
            const duration = 1400;
            const start = performance.now();
            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setStatValues(STATS.map((s) => s.value * eased));
              if (progress < 1) window.requestAnimationFrame(tick);
            };
            window.requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Kéo thanh so sánh trước/sau trên ảnh hero
  const updateSliderFromClientX = (clientX: number) => {
    const el = heroArtRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(96, Math.max(4, pct)));
  };

  const handleSliderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    updateSliderFromClientX(e.clientX);
    const onMove = (ev: PointerEvent) => updateSliderFromClientX(ev.clientX);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowLeft") setSliderPos((p) => Math.max(4, p - 5));
    if (e.key === "ArrowRight") setSliderPos((p) => Math.min(96, p + 5));
  };

  // Smooth scroll for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      
      const href = target.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const id = href.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          // Focus đúng vào section đích sau khi cuộn xong (trợ năng + điều hướng bàn phím)
          const hadTabIndex = element.hasAttribute("tabindex");
          if (!hadTabIndex) element.setAttribute("tabindex", "-1");
          window.setTimeout(() => {
            element.focus({ preventScroll: true });
            if (!hadTabIndex) element.removeAttribute("tabindex");
          }, 500);
        }
      }
    };

    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    links.forEach((link) => link.addEventListener("click", handleAnchorClick));

    return () => {
      links.forEach((link) => link.removeEventListener("click", handleAnchorClick));
    };
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.services && data.services.length > 0) {
        setServices(data.services);
      }
    } catch (e) {
      console.error("Error fetching services:", e);
    }
  };

  const fetchLooks = async () => {
    try {
      const res = await fetch("/api/looks");
      const data = await res.json();
      if (data.looks && data.looks.length > 0) {
        setLooks(data.looks);
      }
    } catch (e) {
      console.error("Error fetching looks:", e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setSettingsForm(data.settings);
      }
    } catch (e) {
      console.error("Error fetching settings:", e);
    }
  };

  // Fetch initial data
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch, setState happens after await
    fetchServices();
    fetchLooks();
    fetchSettings();
  }, []);

  const fetchBookings = async (token: string) => {
    try {
      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error("Error fetching bookings:", e);
    }
  };

  // Booking request submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitting(true);
    setBookingError("");
    setBookingSuccess(false);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookingName,
          phone: bookingPhone,
          service: bookingService,
          date: bookingDate,
          time: bookingTime,
          notes: bookingNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBookingSuccess(true);
        // Clear form
        setBookingName("");
        setBookingPhone("");
        setBookingService("");
        setBookingDate("");
        setBookingTime("");
        setBookingNotes("");
      } else {
        setBookingError(data.error || "Có lỗi xảy ra khi gửi yêu cầu.");
      }
    } catch {
      setBookingError("Không thể kết nối đến máy chủ.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Admin login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminLoggedIn(true);
        setSessionToken(data.token);
        localStorage.setItem("quynh_admin_token", data.token);
        fetchBookings(data.token);
      } else {
        setLoginError(data.error || "Tên tài khoản hoặc mật khẩu không chính xác.");
      }
    } catch {
      setLoginError("Không thể kết nối đến hệ thống xác thực.");
    }
  };

  // Auto-login from localStorage if token exists
  useEffect(() => {
    const savedToken = localStorage.getItem("quynh_admin_token");
    if (!savedToken) return;
    // Verify token via fetching bookings
    fetch("/api/bookings", { headers: { Authorization: `Bearer ${savedToken}` } })
      .then(res => {
        if (res.ok) {
          setSessionToken(savedToken);
          setIsAdminLoggedIn(true);
          fetchBookings(savedToken);
        } else {
          localStorage.removeItem("quynh_admin_token");
        }
      });
  }, []);

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setSessionToken("");
    setAdminUsername("");
    setAdminPassword("");
    localStorage.removeItem("quynh_admin_token");
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchBookings(sessionToken);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Image Upload helper
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "service" | "look") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (target === "service") {
          setServiceForm(prev => ({ ...prev, imageUrl: data.url }));
        } else {
          setLookForm(prev => ({ ...prev, imageUrl: data.url }));
        }
      } else {
        alert("Upload thất bại: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Lỗi upload ảnh.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Service CRUD operations
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!serviceForm.id;
    const url = "/api/services";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(serviceForm),
      });

      if (res.ok) {
        fetchServices();
        setServiceForm({ id: "", name: "", text: "", price: "", icon: "✦", imageUrl: "", order: 0 });
      } else {
        const d = await res.json();
        alert("Lỗi lưu dịch vụ: " + (d.error || "Unknown"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditService = (srv: Service) => {
    setServiceForm({
      id: srv._id,
      name: srv.name,
      text: srv.text || "",
      price: srv.price,
      icon: srv.icon || "✦",
      imageUrl: srv.imageUrl || "",
      order: srv.order || 0,
    });
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa dịch vụ này?")) return;
    try {
      const res = await fetch(`/api/services?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) {
        fetchServices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Look CRUD operations
  const handleLookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/looks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(lookForm),
      });

      if (res.ok) {
        fetchLooks();
        setLookForm({ title: "", tag: "", className: "look-burgundy", imageUrl: "" });
      } else {
        const d = await res.json();
        alert("Lỗi lưu look: " + (d.error || "Unknown"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLook = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa look này?")) return;
    try {
      const res = await fetch(`/api/looks?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) {
        fetchLooks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Settings Save
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        alert("Lưu thông tin salon thành công!");
      } else {
        alert("Lỗi lưu cài đặt: " + (data.error || "Unknown"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main>
      <div className="scroll-progress-track" aria-hidden="true">
        <div className="scroll-progress-bar" style={{ transform: `scaleX(${scrollProgress})` }} />
      </div>
      <div className="cursor-dot" aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true" />
      <header className={`site-header ${isScrolled ? "scrolled" : ""}`}>
        <a className="brand" href="#home" aria-label="Quỳnh Nail ART - Trang chủ">
          <span>Quỳnh</span> Nail ART
        </a>
        <nav aria-label="Điều hướng chính">
          <a href="#home" className={activeSection === "home" ? "active" : ""} aria-current={activeSection === "home" ? "true" : undefined}>Trang chủ</a>
          <a href="#services" className={activeSection === "services" ? "active" : ""} aria-current={activeSection === "services" ? "true" : undefined}>Dịch vụ</a>
          <a href="#gallery" className={activeSection === "gallery" ? "active" : ""} aria-current={activeSection === "gallery" ? "true" : undefined}>Bộ sưu tập</a>
          <a href="#about" className={activeSection === "about" ? "active" : ""} aria-current={activeSection === "about" ? "true" : undefined}>Về Quỳnh</a>
          <a href="#contact" className={activeSection === "contact" ? "active" : ""} aria-current={activeSection === "contact" ? "true" : undefined}>Liên hệ</a>
        </nav>
        <a className="header-book" href="#booking"><span aria-hidden="true">◫</span> Đặt lịch ngay</a>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">{settings.salonName || "Quỳnh Nail ART"} · Since 2022</p>
          <h1 className="word-mask-anim">
            {settings.heroTitle ? (
              settings.heroTitle.split(" ").map((w: string, i: number) => (
                <span className="word-mask" key={i}>
                  <span className="word-inner" style={{ animationDelay: `${0.15 + i * 0.06}s` }}>
                    {w}&nbsp;
                  </span>
                  {(i === 1 || i === 3) && <br />}
                </span>
              ))
            ) : (
              <>
                <span className="word-mask"><span className="word-inner" style={{ animationDelay: "0.15s" }}>Nâng niu</span></span>
                <br />
                <span className="word-mask"><span className="word-inner" style={{ animationDelay: "0.21s" }}>từng đầu</span></span>
                <br />
                <span className="word-mask"><span className="word-inner" style={{ animationDelay: "0.27s" }}>ngón tay</span></span>
              </>
            )}
          </h1>
          <p className="hero-text">{settings.heroText || "Tôn lên nét riêng của bạn với những bộ nail được chăm chút tỉ mỉ trong không gian thư thái, hiện đại."}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#booking">Đặt lịch ngay <Arrow /></a>
            <a className="text-link" href="#services">Xem dịch vụ <Arrow /></a>
          </div>
        </div>
        <div
          className="hero-art before-after"
          ref={heroArtRef}
          role="img"
          aria-label="Kéo để so sánh móng tay trước và sau khi làm nail tại Quỳnh Nail ART"
          onPointerDown={handleSliderPointerDown}
        >
          <div className="pearl-ring" />
          <div className="ba-after">
            <img src="/hero-burgundy-nails.png" alt="Mẫu nail đỏ burgundy tại Quỳnh Nail ART" />
          </div>
          <div className="ba-before" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
            <div className="ba-before-fill" />
          </div>
          <span className="ba-tag ba-tag-before" style={{ opacity: sliderPos > 12 ? 1 : 0 }}>Trước</span>
          <span className="ba-tag ba-tag-after" style={{ opacity: sliderPos < 88 ? 1 : 0 }}>Sau</span>
          <div className="ba-divider" style={{ left: `${sliderPos}%` }}>
            <button
              type="button"
              className="ba-handle"
              aria-label="Kéo để so sánh trước và sau"
              onKeyDown={handleSliderKeyDown}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <span aria-hidden="true">↔</span>
            </button>
          </div>
        </div>
        <div className="trust-bar" aria-label="Cam kết dịch vụ">
          <div><span>♙</span><p><strong>Sơn gel cao cấp</strong><small>An toàn, bền màu</small></p></div>
          <div><span>▣</span><p><strong>Dụng cụ tiệt trùng</strong><small>Quy trình vệ sinh kỹ</small></p></div>
          <div><span>♢</span><p><strong>Thiết kế theo yêu cầu</strong><small>Cá nhân hóa từng mẫu</small></p></div>
        </div>
      </section>

      <section className="stats reveal" aria-label="Con số ấn tượng">
        {STATS.map((s, i) => (
          <div className="stat-item" key={s.label}>
            <strong>{statValues[i].toFixed(s.decimals)}{s.suffix}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </section>

      <section className="section services reveal" id="services">
        <div className="section-heading">
          <div><p className="eyebrow">Dịch vụ nổi bật</p><h2><SplitWords text="Chăm chút cho" /><br /><SplitWords text="từng khoảnh khắc" startDelay={0.4} /></h2></div>
          <p>Từ một bộ móng tối giản đến những thiết kế thật nổi bật, Quỳnh luôn lắng nghe để tạo nên lựa chọn phù hợp với phong cách của bạn.</p>
        </div>
        <div className="service-grid">
          {services.map((service, index) => (
            <article
              className="service-card card-reveal"
              key={service.name}
              onMouseMove={handleCardTilt}
              onMouseLeave={resetCardTilt}
            >
              <div className="service-number">0{index + 1}</div>
              {service.imageUrl ? (
                <img src={service.imageUrl} alt={service.name} style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "8px", marginBottom: "12px" }} />
              ) : (
                <span className="service-icon">{service.icon}</span>
              )}
              <h3>{service.name}</h3>
              <p>{service.text}</p>
              <div className="service-footer">
                <strong>{service.price}</strong>
                <a href="#booking" aria-label={`Đặt lịch ${service.name}`}><Arrow /></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about reveal" id="about">
        <div className="about-visual">
          <span className="big-l">L</span>
          <div className="polish polish-one" /><div className="polish polish-two" />
          <p>Nhẹ nhàng<br />mà khác biệt</p>
        </div>
        <div className="about-copy">
          <p className="eyebrow light">Câu chuyện của Quỳnh</p>
          <h2><SplitWords text="Không chỉ là" /><br /><SplitWords text="một bộ móng đẹp." startDelay={0.4} /></h2>
          <p>{settings.aboutText || "Quỳnh tin rằng thời gian làm nail cũng là lúc bạn dành một khoảng nghỉ cho chính mình. Vì vậy, mỗi trải nghiệm đều được thiết kế để thật chỉn chu, sạch sẽ và thoải mái."}</p>
          <ul>
            <li><span>01</span> Kỹ thuật viên tận tâm, giàu kinh nghiệm</li>
            <li><span>02</span> Sản phẩm có nguồn gốc rõ ràng</li>
            <li><span>03</span> Không gian riêng tư và thư giãn</li>
          </ul>
        </div>
      </section>

      <section className="section gallery reveal" id="gallery">
        <div className="section-heading gallery-heading">
          <div><p className="eyebrow">Quỳnh Collection</p><h2><SplitWords text="Một chút cảm hứng" /><br /><SplitWords text="cho lần hẹn tới" startDelay={0.4} /></h2></div>
          <a className="text-link" href="#booking">Tư vấn mẫu riêng <Arrow /></a>
        </div>
        <div className="look-grid">
          {looks.map((look) => {
            const lookId = look._id || look.title;
            const isImgLoaded = loadedLookImages[lookId];
            return (
            <article
              className={`look-card card-reveal ${look.className} ${look.imageUrl && !isImgLoaded ? "img-loading" : ""}`}
              key={lookId}
              style={look.imageUrl ? {
                background: `url(${look.imageUrl}) center/cover no-repeat`,
                border: "none"
              } : {}}
              onMouseMove={handleCardTilt}
              onMouseLeave={resetCardTilt}
            >
              {!look.imageUrl && (
                <>
                  <div className="nail nail-a" />
                  <div className="nail nail-b" />
                  <div className="nail nail-c" />
                </>
              )}
              <div className="look-meta">
                <span>{look.tag}</span>
                <h3>{look.title}</h3>
              </div>
            </article>
            );
          })}
        </div>
      </section>

      <section className="testimonial reveal">
        <p className="quote-mark">“</p>
        <blockquote>Lần nào đến Quỳnh mình cũng được tư vấn rất kỹ. Mẫu nail vừa xinh, vừa đúng phong cách mà mình muốn.</blockquote>
        <div className="stars">★★★★★</div>
        <p className="customer">Minh Anh · Khách hàng thân thiết</p>
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="booking reveal" id="booking">
        <div>
          <p className="eyebrow light">Ưu đãi chào bạn mới</p>
          <h2><SplitWords text="Giảm 15% cho" /><br /><SplitWords text="lần hẹn đầu tiên." startDelay={0.4} /></h2>
          <p>Để lại thông tin, Quỳnh sẽ liên hệ tư vấn và xác nhận lịch hẹn phù hợp nhất với bạn.</p>
        </div>
        <form onSubmit={handleBookingSubmit}>
          <label>
            Họ và tên
            <input 
              type="text" 
              placeholder="Nguyễn Minh Anh" 
              value={bookingName} 
              onChange={(e) => setBookingName(e.target.value)} 
              required 
            />
          </label>
          <label>
            Số điện thoại
            <input 
              type="tel" 
              placeholder="09xx xxx xxx" 
              value={bookingPhone} 
              onChange={(e) => setBookingPhone(e.target.value)} 
              required 
            />
          </label>
          <label>
            Dịch vụ quan tâm
            <select 
              value={bookingService} 
              onChange={(e) => setBookingService(e.target.value)}
            >
              <option value="">Chọn một dịch vụ</option>
              {services.map(s => (
                <option key={s._id || s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </label>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", gridColumn: "1/-1" }}>
            <label style={{ gridColumn: "auto" }}>
              Ngày hẹn
              <input 
                type="date" 
                value={bookingDate} 
                onChange={(e) => setBookingDate(e.target.value)} 
              />
            </label>
            <label style={{ gridColumn: "auto" }}>
              Giờ hẹn
              <input 
                type="time" 
                value={bookingTime} 
                onChange={(e) => setBookingTime(e.target.value)} 
              />
            </label>
          </div>
          
          <label style={{ gridColumn: "1/-1" }}>
            Ghi chú thêm
            <input 
              type="text" 
              placeholder="Yêu cầu riêng, nhân viên mong muốn..." 
              value={bookingNotes} 
              onChange={(e) => setBookingNotes(e.target.value)} 
            />
          </label>

          {bookingSuccess && (
            <div style={{ gridColumn: "1/-1", background: "rgba(255,255,255,0.15)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.3)" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>✓ Gửi thông tin thành công! Quỳnh sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
            </div>
          )}

          {bookingError && (
            <div style={{ gridColumn: "1/-1", background: "rgba(239, 68, 68, 0.2)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.4)" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>✗ {bookingError}</p>
            </div>
          )}

          <button className="button button-light" type="submit" disabled={bookingSubmitting}>
            {bookingSubmitting ? "Đang gửi..." : "Gửi yêu cầu đặt lịch"} <Arrow />
          </button>
        </form>
      </section>

      <footer id="contact">
        <div className="footer-brand"><span className="brand"><span>Quỳnh</span> Nail ART</span><p>Vẻ đẹp nằm trong từng chi tiết.</p></div>
        <div><strong>Ghé Quỳnh</strong><p>{settings.address || "số nhà 81, Nam Lý, Trung Giã, Hà Nội"}</p><p>{settings.openHours || "08:00 — 20:00 · Thứ 2 — Chủ nhật"}</p></div>
        <div><strong>Liên hệ</strong><a href={`tel:${settings.phone || "0383088262"}`}>{settings.phone || "0383088262"}</a><a href={`mailto:${settings.email || "hello@quynhnail.vn"}`}>{settings.email || "hello@quynhnail.vn"}</a></div>
        <div>
          <strong>Theo dõi</strong>
          <a href={settings.facebookUrl || "https://www.facebook.com/nguyen.quynh.597831"} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center" }}><FacebookIcon />Facebook</a>
          <a href={settings.tiktokUrl || "https://www.tiktok.com/@2uyn21"} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center" }}><TikTokIcon />TikTok</a>
        </div>
        <p className="copyright">© 2026 Quỳnh Nail ART. All rights reserved.</p>
      </footer>

      {/* Admin Floating Trigger Button */}
      <div 
        className="admin-trigger-btn"
        onClick={() => runViewTransition(() => setShowAdminPortal(true))}
        title="Admin Portal"
      >
        ⚙
      </div>

      {/* Admin Dashboard Modal */}
      {showAdminPortal && (
        <div className="admin-modal-overlay">
          {!isAdminLoggedIn ? (
            /* Admin Authentication Card */
            <div className="admin-modal-card login-card">
              <div className="admin-modal-header">
                <h3>Xác thực Admin</h3>
                <button className="admin-close-btn" onClick={() => runViewTransition(() => setShowAdminPortal(false))}>×</button>
              </div>
              <div className="admin-modal-body">
                <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="admin-input-group">
                    <label>Tên đăng nhập</label>
                    <input 
                      type="text" 
                      placeholder="admin" 
                      value={adminUsername} 
                      onChange={(e) => setAdminUsername(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="admin-input-group">
                    <label>Mật khẩu quản trị</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={adminPassword} 
                      onChange={(e) => setAdminPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  {loginError && <p style={{ color: "#b91c1c", fontSize: "13px", margin: 0 }}>{loginError}</p>}
                  <button className="admin-btn admin-btn-primary" type="submit">Đăng nhập</button>
                </form>
              </div>
            </div>
          ) : (
            /* Admin Main Dashboard */
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <h3>Quỳnh Salon Manager</h3>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button className="admin-btn admin-btn-secondary" style={{ padding: "8px 16px" }} onClick={handleAdminLogout}>Đăng xuất</button>
                  <button className="admin-close-btn" onClick={() => runViewTransition(() => setShowAdminPortal(false))}>×</button>
                </div>
              </div>

              <div className="admin-tabs" style={{ padding: "0 32px" }}>
                <button 
                  className={`admin-tab-btn ${activeAdminTab === "bookings" ? "active" : ""}`}
                  onClick={() => setActiveAdminTab("bookings")}
                >
                  Lịch Hẹn ({bookings.length})
                </button>
                <button 
                  className={`admin-tab-btn ${activeAdminTab === "services" ? "active" : ""}`}
                  onClick={() => setActiveAdminTab("services")}
                >
                  Dịch Vụ ({services.length})
                </button>
                <button 
                  className={`admin-tab-btn ${activeAdminTab === "looks" ? "active" : ""}`}
                  onClick={() => setActiveAdminTab("looks")}
                >
                  Bộ Sưu Tập ({looks.length})
                </button>
                <button 
                  className={`admin-tab-btn ${activeAdminTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveAdminTab("settings")}
                >
                  Thông Tin Salon
                </button>
              </div>

              <div className="admin-modal-body" style={{ paddingTop: 0 }}>
                {activeAdminTab === "bookings" && (
                  <div>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Khách Hàng</th>
                          <th>Điện Thoại</th>
                          <th>Dịch Vụ</th>
                          <th>Thời Gian</th>
                          <th>Trạng Thái</th>
                          <th>Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking: Booking) => (
                          <tr key={booking._id}>
                            <td>
                              <strong>{booking.name}</strong>
                              {booking.notes && <div style={{ fontSize: "11px", color: "#7b686c", marginTop: "4px" }}>Ghi chú: {booking.notes}</div>}
                            </td>
                            <td>{booking.phone}</td>
                            <td>{booking.service}</td>
                            <td>
                              {booking.date ? `${booking.date} ${booking.time || ""}` : "Chưa chọn lịch"}
                            </td>
                            <td>
                              <span className={`status-badge ${booking.status || "pending"}`}>
                                {booking.status === "pending" && "Chờ xác nhận"}
                                {booking.status === "confirmed" && "Đã xác nhận"}
                                {booking.status === "completed" && "Hoàn thành"}
                                {booking.status === "cancelled" && "Đã hủy"}
                              </span>
                            </td>
                            <td>
                              <select 
                                value={booking.status || "pending"}
                                onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                                style={{ padding: "4px 8px", fontSize: "12px", border: "1px solid var(--line)", borderRadius: "4px" }}
                              >
                                <option value="pending">Chờ xác nhận</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                        {bookings.length === 0 && (
                          <tr>
                            <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>Chưa có yêu cầu đặt lịch nào.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeAdminTab === "services" && (
                  <div>
                    <form onSubmit={handleServiceSubmit} className="admin-form">
                      <h4>{serviceForm.id ? "Cập Nhật Dịch Vụ" : "Thêm Dịch Vụ Mới"}</h4>
                      <div className="form-grid-2">
                        <div className="admin-input-group">
                          <label>Tên dịch vụ</label>
                          <input 
                            type="text" 
                            placeholder="Sơn gel cao cấp..." 
                            value={serviceForm.name} 
                            onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                            required 
                          />
                        </div>
                        <div className="admin-input-group">
                          <label>Giá dịch vụ</label>
                          <input 
                            type="text" 
                            placeholder="Từ 180.000đ..." 
                            value={serviceForm.price} 
                            onChange={(e) => setServiceForm(prev => ({ ...prev, price: e.target.value }))}
                            required 
                          />
                        </div>
                      </div>

                      <div className="admin-input-group" style={{ marginBottom: "20px" }}>
                        <label>Mô tả chi tiết</label>
                        <textarea 
                          rows={2} 
                          placeholder="Mô tả ngắn gọn về dịch vụ..." 
                          value={serviceForm.text} 
                          onChange={(e) => setServiceForm(prev => ({ ...prev, text: e.target.value }))}
                        />
                      </div>

                      <div className="form-grid-2" style={{ marginBottom: "20px" }}>
                        <div className="admin-input-group">
                          <label>Ký tự Icon (nếu không dùng ảnh)</label>
                          <input 
                            type="text" 
                            placeholder="✦, ◇, ○..." 
                            value={serviceForm.icon} 
                            onChange={(e) => setServiceForm(prev => ({ ...prev, icon: e.target.value }))} 
                          />
                        </div>
                        <div className="admin-input-group">
                          <label>Ảnh dịch vụ (Cloudinary)</label>
                          <div className="upload-btn-container">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleImageUpload(e, "service")} 
                            />
                            {uploadingImage && <span style={{ fontSize: "12px", color: "var(--burgundy)" }}>Đang upload...</span>}
                            {serviceForm.imageUrl && (
                              <img src={serviceForm.imageUrl} alt="Preview" className="upload-preview" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "12px" }}>
                        <button className="admin-btn admin-btn-primary" type="submit">Lưu Dịch Vụ</button>
                        {serviceForm.id && (
                          <button 
                            className="admin-btn admin-btn-secondary" 
                            type="button"
                            onClick={() => setServiceForm({ id: "", name: "", text: "", price: "", icon: "✦", imageUrl: "", order: 0 })}
                          >
                            Hủy chỉnh sửa
                          </button>
                        )}
                      </div>
                    </form>

                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Icon/Ảnh</th>
                          <th>Tên Dịch Vụ</th>
                          <th>Mô Tả</th>
                          <th>Giá</th>
                          <th>Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((srv: Service) => (
                          <tr key={srv._id}>
                            <td>
                              {srv.imageUrl ? (
                                <img src={srv.imageUrl} alt={srv.name} className="upload-preview" />
                              ) : (
                                <span style={{ fontSize: "20px", color: "var(--burgundy)" }}>{srv.icon}</span>
                              )}
                            </td>
                            <td><strong>{srv.name}</strong></td>
                            <td>{srv.text}</td>
                            <td>{srv.price}</td>
                            <td>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button className="admin-btn admin-btn-secondary" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={() => handleEditService(srv)}>Sửa</button>
                                <button className="admin-btn admin-btn-danger" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={() => handleDeleteService(srv._id)}>Xóa</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeAdminTab === "looks" && (
                  <div>
                    <form onSubmit={handleLookSubmit} className="admin-form">
                      <h4>Thêm Look (Hình Ảnh Mẫu)</h4>
                      <div className="form-grid-2">
                        <div className="admin-input-group">
                          <label>Tên thiết kế</label>
                          <input 
                            type="text" 
                            placeholder="Milky Chrome..." 
                            value={lookForm.title} 
                            onChange={(e) => setLookForm(prev => ({ ...prev, title: e.target.value }))}
                            required 
                          />
                        </div>
                        <div className="admin-input-group">
                          <label>Thẻ phân loại (Tag)</label>
                          <input 
                            type="text" 
                            placeholder="Tinh tế, Tối giản..." 
                            value={lookForm.tag} 
                            onChange={(e) => setLookForm(prev => ({ ...prev, tag: e.target.value }))}
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-grid-2" style={{ marginBottom: "20px" }}>
                        <div className="admin-input-group">
                          <label>Kiểu mẫu (Class CSS nếu không dùng ảnh)</label>
                          <select 
                            value={lookForm.className}
                            onChange={(e) => setLookForm(prev => ({ ...prev, className: e.target.value }))}
                          >
                            <option value="look-burgundy">Burgundy Pearl Style</option>
                            <option value="look-milk">Milky Chrome Style</option>
                            <option value="look-french">Modern French Style</option>
                          </select>
                        </div>
                        <div className="admin-input-group">
                          <label>Tải ảnh mẫu lên Cloudinary</label>
                          <div className="upload-btn-container">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleImageUpload(e, "look")} 
                            />
                            {uploadingImage && <span style={{ fontSize: "12px", color: "var(--burgundy)" }}>Đang upload...</span>}
                            {lookForm.imageUrl && (
                              <img src={lookForm.imageUrl} alt="Preview" className="upload-preview" />
                            )}
                          </div>
                        </div>
                      </div>

                      <button className="admin-btn admin-btn-primary" type="submit">Lưu Look</button>
                    </form>

                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Ảnh Mẫu</th>
                          <th>Tên Thiết Kế</th>
                          <th>Thẻ (Tag)</th>
                          <th>Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {looks.map((look: Look) => (
                          <tr key={look._id}>
                            <td>
                              {look.imageUrl ? (
                                <img src={look.imageUrl} alt={look.title} className="upload-preview" />
                              ) : (
                                <div className={`look-card ${look.className}`} style={{ width: "60px", height: "40px", padding: 0, overflow: "hidden", borderRadius: "4px" }} />
                              )}
                            </td>
                            <td><strong>{look.title}</strong></td>
                            <td><span className="status-badge confirmed" style={{ background: "#eae3e1", color: "var(--burgundy)" }}>{look.tag}</span></td>
                            <td>
                              <button className="admin-btn admin-btn-danger" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={() => handleDeleteLook(look._id)}>Xóa</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeAdminTab === "settings" && (
                  <div>
                    <form onSubmit={handleSettingsSubmit} className="admin-form">
                      <h4>Cập Nhật Thông Tin Salon</h4>
                      
                      <div className="form-grid-2">
                        <div className="admin-input-group">
                          <label>Tên Salon</label>
                          <input 
                            type="text" 
                            value={settingsForm.salonName} 
                            onChange={(e) => setSettingsForm((prev: Settings) => ({ ...prev, salonName: e.target.value }))}
                            required 
                          />
                        </div>
                        <div className="admin-input-group">
                          <label>Số điện thoại</label>
                          <input 
                            type="text" 
                            value={settingsForm.phone} 
                            onChange={(e) => setSettingsForm((prev: Settings) => ({ ...prev, phone: e.target.value }))}
                            required 
                          />
                        </div>
                      </div>

                      <div className="form-grid-2" style={{ marginTop: "16px" }}>
                        <div className="admin-input-group">
                          <label>Email liên hệ</label>
                          <input 
                            type="email" 
                            value={settingsForm.email} 
                            onChange={(e) => setSettingsForm((prev: Settings) => ({ ...prev, email: e.target.value }))}
                            required 
                          />
                        </div>
                        <div className="admin-input-group">
                          <label>Địa chỉ</label>
                          <input 
                            type="text" 
                            value={settingsForm.address} 
                            onChange={(e) => setSettingsForm((prev: Settings) => ({ ...prev, address: e.target.value }))}
                            required 
                          />
                        </div>
                      </div>

                      <div className="admin-input-group" style={{ marginTop: "16px" }}>
                        <label>Giờ hoạt động</label>
                        <input 
                          type="text" 
                          value={settingsForm.openHours} 
                          onChange={(e) => setSettingsForm((prev: Settings) => ({ ...prev, openHours: e.target.value }))}
                          required 
                        />
                      </div>

                      <div className="form-grid-2" style={{ marginTop: "16px" }}>
                        <div className="admin-input-group">
                          <label>Tiêu đề chính (Hero Title)</label>
                          <input 
                            type="text" 
                            value={settingsForm.heroTitle} 
                            onChange={(e) => setSettingsForm((prev: Settings) => ({ ...prev, heroTitle: e.target.value }))}
                            required 
                          />
                        </div>
                        <div className="admin-input-group">
                          <label>Mô tả chính (Hero Text)</label>
                          <textarea 
                            rows={2}
                            value={settingsForm.heroText} 
                            onChange={(e) => setSettingsForm((prev: Settings) => ({ ...prev, heroText: e.target.value }))}
                            required 
                          />
                        </div>
                      </div>

                      <div className="admin-input-group" style={{ marginTop: "16px" }}>
                        <label>Giới thiệu (About Copy)</label>
                        <textarea 
                          rows={3}
                          value={settingsForm.aboutText} 
                          onChange={(e) => setSettingsForm((prev: Settings) => ({ ...prev, aboutText: e.target.value }))}
                          required 
                        />
                      </div>

                      <div className="form-grid-2" style={{ marginTop: "16px", marginBottom: "24px" }}>
                        <div className="admin-input-group">
                          <label>Facebook URL</label>
                          <input 
                            type="text" 
                            value={settingsForm.facebookUrl} 
                            onChange={(e) => setSettingsForm((prev: Settings) => ({ ...prev, facebookUrl: e.target.value }))}
                          />
                        </div>
                        <div className="admin-input-group">
                          <label>TikTok URL</label>
                          <input 
                            type="text" 
                            value={settingsForm.tiktokUrl} 
                            onChange={(e) => setSettingsForm((prev: Settings) => ({ ...prev, tiktokUrl: e.target.value }))}
                          />
                        </div>
                      </div>

                      <button className="admin-btn admin-btn-primary" type="submit">Lưu Cài Đặt</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
