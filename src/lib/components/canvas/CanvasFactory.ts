import { renderer } from '$lib/store'
import { setGridOnCanvasWithMM } from '$lib/utils'
import { fabric } from 'fabric'

export class CanvasFactory {
	private static instance: CanvasFactory | null = null
	static async getInstance(canvas: HTMLCanvasElement): Promise<CanvasFactory | null> {
		if (!this.instance && typeof document !== 'undefined') {
			const newCanvas = new fabric.Canvas(canvas, {
				width: window.innerWidth,
				height: window.innerHeight,
				centeredScaling: true,
				centeredRotation: true,
				backgroundColor: 'rgba(255, 255, 255, 0)',
				// . preserveObjectStacking 옵션을 true로 설정하면, fabric.Canvas 인스턴스가 크기를 변경할 때,
				// 객체들의 쌓이는 순서를 유지하면서 비율이 일치하도록 자동으로 조정됩니다.
				preserveObjectStacking: true,
				selection: true,
				hoverCursor: 'pointer',
				moveCursor: 'move',
				defaultCursor: 'default',
				fireRightClick: true,
			})
			// 배경 그리드 추가 TODO : 객체로 만들지 말 것 (STATIC CANVAS.)
			// setGridOnCanvasWithMM(newCanvas)
			newCanvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), 2.7)

			fabric.ActiveSelection.prototype.cornerStyle = 'circle'
			fabric.Group.prototype.cornerStyle = 'circle'
			fabric.Object.prototype.cornerStyle = 'circle'

			if (!newCanvas) {
				return null
			}
			this.instance = new CanvasFactory(newCanvas)
		}
		return this.instance
	}
	constructor(public readonly canvas: fabric.Canvas) {}
}

export class StaticCanvasFactory {
	private static instance: StaticCanvasFactory | null = null
	static async getInstance(canvas: HTMLCanvasElement): Promise<StaticCanvasFactory | null> {
		if (!this.instance && typeof document !== 'undefined') {
			const staticCanvas = new fabric.StaticCanvas(canvas, {
				width: window.innerWidth,
				height: window.innerHeight,
				backgroundColor: 'rgba(255,255,255,0)',
			})
			if (!staticCanvas) {
				return null
			}
			this.instance = new StaticCanvasFactory(staticCanvas)
		}
		return this.instance
	}
	constructor(public readonly canvas: fabric.StaticCanvas) {}
}

export const makeArrowLine = () => {
	if (typeof document !== 'undefined') {
		return fabric.util.createClass(fabric.Line, {
			type: 'line_width_arrow',
			initialize(element: HTMLElement, options: Partial<fabric.ILineOptions>) {
				options || (options = {})
				this.callSuper('initialize', element, options)

				// Set default options
				this.set({
					stroke: 'rgba(0,0,0,1)',
					strokeWidth: 3,
					strokeLineCap: 'round',
					originX: 'center',
					originY: 'center',
					selectable: true,
					targetFindTolerance: true,
				})
			},

			_render(ctx: CanvasRenderingContext2D) {
				this.callSuper('_render', ctx)
				ctx.save()
				const xDiff = this.x2 - this.x1
				const yDiff = this.y2 - this.y1
				const angle = Math.atan2(yDiff, xDiff)
				ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2)
				ctx.rotate(angle)
				ctx.beginPath()
				// Move 5px in front of line to start the arrow so it does not have the square line end showing in front (0,0)
				ctx.moveTo(5, 0)
				ctx.lineTo(-5, 5)
				ctx.lineTo(-5, -5)
				ctx.closePath()
				ctx.fillStyle = this.stroke
				ctx.fill()
				ctx.restore()
			},
		})
	}
}