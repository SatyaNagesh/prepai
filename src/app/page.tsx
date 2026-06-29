export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">PrepAI</div>
          <div className="flex gap-4">
            <a href="/auth/login" className="text-sm font-medium hover:text-blue-600">Log in</a>
            <a href="/auth/signup" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign up free</a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Crack your campus placement
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Practice mock interviews for TCS, Infosys, Wipro, Cognizant & more.
            Get AI-powered feedback and improve your chances of landing the job.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/auth/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700">
              Start practicing — free
            </a>
            <a href="#how-it-works" className="border px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50">
              How it works
            </a>
          </div>
        </section>

        <section id="how-it-works" className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Choose a company", desc: "Pick from TCS, Infosys, Wipro, or other top recruiters" },
                { step: "2", title: "Practice interviews", desc: "Answer real interview questions. Type or speak your responses." },
                { step: "3", title: "Get AI feedback", desc: "Receive a score, detailed feedback, and an improved answer." },
              ].map((item) => (
                <div key={item.step} className="bg-white p-6 rounded-xl shadow-sm border text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-8">Supported companies</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Amazon"].map((c) => (
              <div key={c} className="border rounded-lg p-4 text-center font-medium text-gray-700 hover:border-blue-300">
                {c}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-blue-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Start your preparation today</h2>
            <p className="text-lg mb-8 opacity-90">₹0 to start. Upgrade to Pro for ₹199/month when you're ready.</p>
            <a href="/auth/signup" className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 inline-block">
              Create free account
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>PrepAI — AI interview coach for Indian students</p>
      </footer>
    </div>
  );
}
