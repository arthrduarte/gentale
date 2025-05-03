import type { Scene as SceneType } from "@/types/db";

export default function Scene({ scene }: { scene: SceneType }) {
    return (
        <>
            <p className="text-gray-600 text-center mb-4 italic">
              {scene.input}
            </p>
            <div 
              key={scene.id}
              className="bg-white rounded-2xl p-6 shadow-lg"
              style={{ border: '2px solid rgba(244, 91, 105, 0.2)' }}
            >
              <div className="prose max-w-none" style={{ whiteSpace: 'pre-wrap' }}>
                {scene.text}
              </div>
            </div>
        </>
    )
}
